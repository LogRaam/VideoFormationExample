"""Build the narration track from script/narration.json.

For every segment:
  * generate N takes with the configured TTS voice (cached by content hash),
  * transcribe each take with faster-whisper and reject takes whose transcript
    drifts from the script (hallucinations, skipped words),
  * let an audio-understanding model pick the best remaining take,
  * trim silence and level-match.
Then lay the segments on a timeline, write video/public/audio/narration.wav,
video/src/data/timeline.json (scene/segment/word timings) and output/*.srt.

Usage: python tts_build.py [--takes 2] [--redo seg_id,seg_id] [--no-judge]
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import difflib
import hashlib
import json
import re
import wave
from pathlib import Path

import numpy as np
from scipy.signal import resample_poly

from openrouter import ROOT, audio_part, chat, speech

LANG = "en"  # set from --lang in main(); "fr" uses narration.fr.json and *.fr outputs
SCRIPT = ROOT / "script" / "narration.json"
TAKES = ROOT / "build" / "tts"


def suffix() -> str:
    return "" if LANG == "en" else f".{LANG}"
PUBLIC = ROOT / "video" / "public" / "audio"
DATA = ROOT / "video" / "src" / "data"
OUTPUT = ROOT / "output"
SR = 48000
JUDGE_MODEL = "google/gemini-3.1-pro-preview"


# ---------------------------------------------------------------- audio utils
def read_wav(p: Path) -> tuple[np.ndarray, int]:
    with wave.open(str(p), "rb") as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
    return x, sr


def write_wav(p: Path, x: np.ndarray, sr: int = SR) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    y = np.clip(x, -1, 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((y * 32767).astype(np.int16).tobytes())


def to48k(x: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR:
        return x
    g = np.gcd(sr, SR)
    return resample_poly(x, SR // g, sr // g).astype(np.float32)


def trim(x: np.ndarray, sr: int, thresh_db: float = -42, pre: float = 0.04, post: float = 0.12) -> tuple[np.ndarray, float]:
    """Strip leading/trailing silence. Returns (audio, seconds removed from the start)."""
    win = int(sr * 0.01)
    n = len(x) // win
    if n == 0:
        return x, 0.0
    rms = np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    active = np.where(db > thresh_db)[0]
    if len(active) == 0:
        return x, 0.0
    a = max(0, active[0] * win - int(pre * sr))
    b = min(len(x), (active[-1] + 1) * win + int(post * sr))
    y = x[a:b].copy()
    fade = int(0.008 * sr)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    return y, a / sr


def speech_rms(x: np.ndarray, sr: int) -> float:
    win = int(sr * 0.02)
    n = len(x) // win
    rms = np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(axis=1) + 1e-12)
    act = rms[20 * np.log10(rms) > -40]
    return float(np.sqrt((act ** 2).mean())) if len(act) else 1e-3


# ---------------------------------------------------------------- text utils
NUMBERS = {"1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven",
           "8": "eight", "9": "nine", "10": "ten", "11": "eleven", "12": "twelve"}


def norm_words(t: str) -> list[str]:
    t = t.lower().replace("’", "'").replace("-", " ")
    # Whisper writes the product name and the anglicism in several ways
    t = re.sub(r"launch\s*darkly", "launchdarkly", t)
    t = re.sub(r"feature\s*flags?|fitcheur\s*flag", "featureflag", t)
    return [NUMBERS.get(x, x) for x in re.findall(r"[^\W_]+(?:'[^\W_]+)*", t)]


def wer(ref: str, hyp: str) -> float:
    r, h = norm_words(ref), norm_words(hyp)
    sm = difflib.SequenceMatcher(a=r, b=h, autojunk=False)
    matched = sum(b.size for b in sm.get_matching_blocks())
    return 1 - matched / max(1, len(r))


# ---------------------------------------------------------------- ASR
_model = None


def _add_cuda_dlls() -> None:
    """pip-installed nvidia-* wheels ship their DLLs in site-packages/nvidia/*/bin."""
    import os
    import site
    for sp in [*site.getsitepackages(), site.getusersitepackages()]:
        base = Path(sp) / "nvidia"
        if base.exists():
            for b in base.glob("*/bin"):
                os.add_dll_directory(str(b))
                os.environ["PATH"] = f"{b};{os.environ['PATH']}"


def asr():
    global _model
    if _model is None:
        _add_cuda_dlls()
        from faster_whisper import WhisperModel
        name = "medium.en" if LANG == "en" else "large-v3"
        try:
            _model = WhisperModel(name, device="cuda", compute_type="float16")
            list(_model.transcribe(np.zeros(16000, dtype=np.float32))[0])  # cuDNN/cuBLAS load lazily
            print("whisper: cuda")
        except Exception as e:  # noqa: BLE001
            print("whisper: cuda unavailable, using cpu:", str(e)[:120])
            _model = WhisperModel(name, device="cpu", compute_type="int8")
    return _model


GLOSSARY = "Glossary: QA, QC, Waterfall, V-model, go-live, no-go, smoke-test, lead-time, fixed-price."
GLOSSARY_FR = "Glossaire : LaunchDarkly, feature flag, indicateur de fonctionnalité, tableau de bord, branche principale, fusionnée, déployée, redéploiement, configuration."


def transcribe(p: Path, prompt: str) -> tuple[str, list[dict]]:
    # NB: passing the script itself as initial_prompt makes Whisper skip the
    # opening sentence (it believes it was already transcribed) - use a glossary.
    glossary = GLOSSARY if LANG == "en" else GLOSSARY_FR
    segs, _ = asr().transcribe(str(p), language=LANG, word_timestamps=True, beam_size=5,
                               initial_prompt=glossary, vad_filter=False)
    words, text = [], []
    for s in segs:
        text.append(s.text)
        for w in s.words or []:
            words.append({"w": w.word.strip(), "start": float(w.start), "end": float(w.end)})
    return " ".join(text).strip(), words


def align_words(script_text: str, asr_words: list[dict], dur: float) -> list[dict]:
    """Map every script word onto ASR word timings (interpolating gaps)."""
    raw_tokens = script_text.replace("—", " ").split()
    # punctuation-only tokens (French " :", " ?", « ») stay attached to a neighbouring word
    tokens: list[str] = []
    pending = ""
    for tok in raw_tokens:
        if norm_words(tok):
            tokens.append(pending + tok)
            pending = ""
        elif tokens and tok not in ("«", "“", "("):
            tokens[-1] += " " + tok
        else:
            pending += tok + " "
    ref = [" ".join(norm_words(t)) for t in tokens]
    hyp = [" ".join(norm_words(w["w"])) for w in asr_words]
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    times: list[tuple[float, float] | None] = [None] * len(tokens)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (asr_words[j1 + k]["start"], asr_words[j1 + k]["end"])
        elif op == "replace" and j2 > j1:
            s, e = asr_words[j1]["start"], asr_words[j2 - 1]["end"]
            n = i2 - i1
            for k in range(n):
                times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
    # interpolate missing
    for i in range(len(times)):
        if times[i] is None:
            prev_end = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
            nxt = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), dur)
            times[i] = (prev_end, max(prev_end, nxt))
    return [{"w": t, "start": round(a, 3), "end": round(b, 3)} for t, (a, b) in zip(tokens, times)]


# ---------------------------------------------------------------- pipeline
def seg_style(cfg: dict, seg: dict) -> str:
    base = cfg["voice"]["style"]
    return f"{base} {seg['style']}" if seg.get("style") else base


def take_path(cfg: dict, seg: dict, take: int) -> Path:
    v = cfg["voice"]
    key = json.dumps([v["model"], v["voice"], seg_style(cfg, seg), seg["text"], take])
    h = hashlib.sha1(key.encode()).hexdigest()[:10]
    return TAKES / f"{seg['id']}__t{take}_{h}.wav"


def gen_take(cfg: dict, seg: dict, take: int) -> Path:
    p = take_path(cfg, seg, take)
    if not p.exists():
        v = cfg["voice"]
        speech(seg["text"], v["model"], v["voice"], p, fmt="wav",
               provider={"options": {"google-ai-studio": {"speech_metadata": {"style": seg_style(cfg, seg)}}}})
    return p


def judge(seg: dict, takes: list[Path]) -> int:
    content = [{"type": "text", "text": (
        "You are the director of a premium educational explainer video narrated in Quebec French (français québécois). Several takes of the SAME narration line follow. "
        f"Script: \"{seg['text']}\"\n"
        "Pick the take with the most natural, engaging, human delivery, correct emphasis, no artifacts, no mispronunciations, "
        "and no added or missing words. Prefer a natural, professional Quebec French accent, and a correct English-style pronunciation of \"LaunchDarkly\" and \"feature flag\". Reply ONLY with JSON {\"best\": <take number>, \"why\": \"...\"}.")}]
    for i, t in enumerate(takes, 1):
        content += [{"type": "text", "text": f"Take {i}:"}, audio_part(t)]
    for _ in range(3):
        try:
            r = chat(JUDGE_MODEL, [{"role": "user", "content": content}])
            txt = r["choices"][0]["message"]["content"] or ""
            d = json.loads(re.search(r"\{.*\}", txt, re.S).group(0))
            b = int(d["best"]) - 1
            if 0 <= b < len(takes):
                print(f"    judge {seg['id']}: take {b + 1} - {d.get('why', '')[:110]}")
                return b
        except Exception as e:  # noqa: BLE001
            print("    judge retry", seg["id"], e)
    return 0


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--takes", type=int, default=2)
    ap.add_argument("--redo", default="", help="comma separated segment ids to regenerate with fresh takes")
    ap.add_argument("--no-judge", action="store_true")
    ap.add_argument("--lang", default="fr", choices=["en", "fr"])
    args = ap.parse_args()

    global LANG, SCRIPT, TAKES
    LANG = args.lang
    if LANG != "en":
        SCRIPT = ROOT / "script" / f"narration{suffix()}.json"
        TAKES = ROOT / "build" / f"tts_{LANG}"
    TAKES.mkdir(parents=True, exist_ok=True)
    cfg = json.loads(SCRIPT.read_text(encoding="utf-8"))
    segs = [s for sc in cfg["scenes"] for s in sc["segments"]]
    redo = set(filter(None, args.redo.split(",")))
    choice_file = TAKES / "choices.json"
    choices = json.loads(choice_file.read_text()) if choice_file.exists() else {}

    # 1. generate takes in parallel
    jobs = [(s, t) for s in segs for t in range(args.takes)]
    if redo:
        for s in segs:
            if s["id"] in redo:
                for t in range(args.takes):
                    take_path(cfg, s, t).unlink(missing_ok=True)
                choices.pop(s["id"], None)
    print(f"generating {len(jobs)} takes...")
    with cf.ThreadPoolExecutor(3) as ex:
        futs = {ex.submit(gen_take, cfg, s, t): (s["id"], t) for s, t in jobs}
        for f in cf.as_completed(futs):
            f.result()

    # 2. ASR check (transcripts cached per take file)
    asr_file = TAKES / "asr.json"
    asr_cache = json.loads(asr_file.read_text()) if asr_file.exists() else {}
    goods: dict[str, list[dict]] = {}
    for s in segs:
        cands = []
        for t in range(args.takes):
            p = take_path(cfg, s, t)
            if p.name not in asr_cache:
                txt, words = transcribe(p, s["text"])
                asr_cache[p.name] = {"text": txt, "words": words}
                asr_file.write_text(json.dumps(asr_cache))
            txt, words = asr_cache[p.name]["text"], asr_cache[p.name]["words"]
            e = wer(s["text"], txt)
            cands.append({"path": p, "wer": e, "text": txt, "words": words})
            flag = "" if e <= 0.08 else "   <-- DRIFT"
            print(f"  {s['id']:6s} t{t} wer={e:.2f} {txt[:80]}{flag}", flush=True)
        goods[s["id"]] = [c for c in cands if c["wer"] <= 0.08] or sorted(cands, key=lambda c: c["wer"])[:1]

    # 3. choose the best take (judge calls in parallel, results cached)
    def choose(s: dict) -> tuple[str, dict]:
        good = goods[s["id"]]
        key = "|".join(c["path"].name for c in good)
        if len(good) == 1 or args.no_judge:
            return s["id"], good[0]
        if choices.get(s["id"], {}).get("key") == key:
            return s["id"], good[choices[s["id"]]["idx"]]
        idx = judge(s, [c["path"] for c in good])
        choices[s["id"]] = {"key": key, "idx": idx}
        return s["id"], good[idx]

    results: dict[str, dict] = {}
    with cf.ThreadPoolExecutor(3) as ex:
        for sid, pick in ex.map(choose, segs):
            results[sid] = pick
    choice_file.write_text(json.dumps(choices, indent=1))

    # 3. assemble
    target = 0.075  # speech RMS
    timeline = {"fps_hint": 30, "scenes": [], "duration": 0.0}
    track: list[np.ndarray] = []
    t = 0.0

    def pad(sec: float):
        nonlocal t
        n = int(round(sec * SR))
        track.append(np.zeros(n, dtype=np.float32))
        t += n / SR

    for si, sc in enumerate(cfg["scenes"]):
        lead = sc.get("lead_in", cfg["gaps"]["scene"] if si else 1.0)
        pad(lead)
        scene = {"id": sc["id"], "start": round(t, 3), "segments": []}
        for k, s in enumerate(sc["segments"]):
            if k:
                pad(s.get("gap_before", cfg["gaps"]["segment"]))
            pick = results[s["id"]]
            x, sr = read_wav(pick["path"])
            y, offset = trim(to48k(x, sr), SR)
            y = y * (target / speech_rms(y, SR))
            dur = len(y) / SR
            words = align_words(s["text"], pick["words"], dur + offset)
            for w in words:
                w["start"] = round(max(0.0, w["start"] - offset) + t, 3)
                w["end"] = round(max(0.0, w["end"] - offset) + t, 3)
            seg = {"id": s["id"], "text": s["text"], "start": round(t, 3), "end": round(t + dur, 3), "words": words}
            scene["segments"].append(seg)
            track.append(y.astype(np.float32))
            t += len(y) / SR
        pad(sc.get("silence_after", 0.0))
        scene["end"] = round(t, 3)
        timeline["scenes"].append(scene)
    pad(0.5)
    timeline["duration"] = round(t, 3)

    audio = np.concatenate(track)
    peak = np.abs(audio).max()
    if peak > 0.97:
        audio *= 0.97 / peak
    raw = ROOT / "build" / f"narration_raw{suffix()}.wav"
    write_wav(raw, audio)
    # vocal polish: remove impulsive clicks, soften sibilance / harsh plosive bursts
    import subprocess
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af",
                    "adeclick,equalizer=f=6500:t=q:w=1.0:g=-3.5,equalizer=f=9000:t=q:w=1.0:g=-1.5",
                    "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(PUBLIC / f"narration{suffix()}.wav")], check=True)
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / f"timeline{suffix()}.json").write_text(json.dumps(timeline, indent=1), encoding="utf-8")
    import make_srt  # word-timed subtitles from the fresh timeline
    make_srt.main(LANG)
    print(f"\nnarration: {t:.1f}s  ({t / 60:.2f} min)")
    for sc in timeline["scenes"]:
        print(f"  {sc['id']:12s} {sc['start']:7.2f} -> {sc['end']:7.2f}  ({sc['end'] - sc['start']:.1f}s)")


if __name__ == "__main__":
    main()
