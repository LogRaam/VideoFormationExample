"""Procedurally synthesised sound-design kit (48 kHz stereo WAV).

Every effect is built from oscillators, filtered noise and a shared synthetic
room reverb so the whole set sounds like one cohesive family.
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "video" / "public" / "audio" / "sfx"
SR = 48000
rng = np.random.default_rng(7)


def t_axis(d: float) -> np.ndarray:
    return np.arange(int(d * SR)) / SR


def noise(d: float) -> np.ndarray:
    return rng.standard_normal(int(d * SR))


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "highpass", fs=SR, output="sos"), x)


def env_adsr(n, a=0.005, d=0.1, s=0.0, r=0.1, sustain_t=0.0):
    a_n, d_n, st_n, r_n = (int(v * SR) for v in (a, d, sustain_t, r))
    e = np.concatenate([np.linspace(0, 1, max(a_n, 1)), np.linspace(1, s, max(d_n, 1)),
                        np.full(st_n, s), np.linspace(s, 0, max(r_n, 1))])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def exp_env(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def swept_filter_noise(d, f0, f1, q=3.0, curve=1.0):
    """Noise through a time-varying band-pass (block-wise)."""
    x = noise(d)
    out = np.zeros_like(x)
    block = 256
    nb = (len(x) + block - 1) // block
    zi = None
    for b in range(nb):
        u = (b / max(1, nb - 1)) ** curve
        f = f0 * (f1 / f0) ** u
        bw = f / q
        sos = butter(2, [max(30, f - bw / 2), min(SR / 2 - 100, f + bw / 2)], "bandpass", fs=SR, output="sos")
        seg = x[b * block:(b + 1) * block]
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = sosfilt(sos, seg, zi=zi)
        out[b * block:b * block + len(y)] = y
    return out


_IR = None


def reverb(stereo: np.ndarray, wet=0.18, decay=1.1) -> np.ndarray:
    global _IR
    if _IR is None:
        n = int(decay * SR)
        irs = []
        for _ in range(2):
            ir = rng.standard_normal(n) * exp_env(n, decay / 6.5)
            ir = lp(ir, 6500)
            ir[: int(0.012 * SR)] = 0  # pre-delay
            irs.append(ir / np.sqrt((ir ** 2).sum()))
        _IR = irs
    out = stereo.copy()
    pad = len(_IR[0])
    out = np.pad(out, ((0, pad), (0, 0)))
    for c in range(2):
        out[:, c] = out[:, c] + wet * fftconvolve(np.pad(stereo[:, c], (0, pad)), _IR[c])[: len(out)]
    return out


def st(mono: np.ndarray, pan: float = 0.0, width: float = 0.0) -> np.ndarray:
    """Mono -> stereo with constant-power pan and optional Haas width."""
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    s = np.stack([mono * l, mono * r], axis=1) * np.sqrt(2)
    if width:
        dly = int(width * 0.012 * SR)
        s[:, 1] = np.concatenate([np.zeros(dly), s[:-dly, 1]]) if dly else s[:, 1]
    return s


def save(name: str, x: np.ndarray, peak_db: float = -3.0, rev=0.18) -> None:
    if x.ndim == 1:
        x = st(x)
    if rev:
        x = reverb(x, wet=rev)
    # trim tail silence
    mag = np.abs(x).max(axis=1)
    idx = np.where(mag > 10 ** (-70 / 20) * mag.max())[0]
    x = x[: idx[-1] + 1] if len(idx) else x
    fade = min(len(x), int(0.01 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print(f"{name:16s} {len(x) / SR:5.2f}s")


# ------------------------------------------------------------------ effects
def whoosh(d=0.7, f0=300, f1=3500, pan_from=-0.6, pan_to=0.6, peak=-6):
    x = swept_filter_noise(d, f0, f1, q=2.2, curve=0.8)
    e = np.sin(np.pi * np.clip(t_axis(d) / d, 0, 1)) ** 1.6
    x *= e
    pans = np.linspace(pan_from, pan_to, len(x))
    l, r = np.cos((pans + 1) * np.pi / 4), np.sin((pans + 1) * np.pi / 4)
    return np.stack([x * l, x * r], axis=1)


def pop(f=820, d=0.16, drop=0.55):
    t = t_axis(d)
    freq = f * (1 - drop * (1 - np.exp(-t / 0.03)))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    x = np.sin(ph) * exp_env(len(t), 0.035)
    click = hp(noise(0.006), 2500) * 0.25
    x[: len(click)] += click * np.linspace(1, 0, len(click))
    return x


def tick(f=2400):
    d = 0.05
    x = np.sin(2 * np.pi * f * t_axis(d)) * exp_env(int(d * SR), 0.006)
    x += hp(noise(d), 4000) * exp_env(int(d * SR), 0.003) * 0.6
    return x


def bell(freqs, d=1.6, tau=0.5, bright=1.0):
    t = t_axis(d)
    x = np.zeros_like(t)
    for i, f in enumerate(freqs):
        for k, (ratio, amp) in enumerate([(1, 1), (2.0, 0.35 * bright), (3.01, 0.12 * bright), (4.2, 0.06 * bright)]):
            x += amp * np.sin(2 * np.pi * f * ratio * t + i) * exp_env(len(t), tau / (1 + k * 0.8)) * (0.9 ** i)
    x *= env_adsr(len(t), a=0.003, d=d, s=1.0, r=0.01, sustain_t=0)
    return x


def chime_success():
    a = bell([880.0], d=1.2, tau=0.45)
    b = bell([1318.5], d=1.2, tau=0.5)
    off = int(0.085 * SR)
    x = np.zeros(len(b) + off)
    x[: len(a)] += a
    x[off:off + len(b)] += b * 0.9
    return x


def soft_error():
    d = 0.5
    t = t_axis(d)
    x = (np.sin(2 * np.pi * 196 * t) + 0.6 * np.sin(2 * np.pi * 207.6 * t) + 0.3 * np.sign(np.sin(2 * np.pi * 98 * t)) * 0.2)
    x = lp(x, 1600) * env_adsr(len(t), a=0.005, d=0.08, s=0.55, r=0.25, sustain_t=0.1)
    return x


def bug_blip(f=520):
    d = 0.22
    t = t_axis(d)
    fm = np.sin(2 * np.pi * 38 * t) * 120
    x = np.sin(2 * np.pi * np.cumsum(f + fm) / SR) * exp_env(len(t), 0.06)
    return lp(x, 3000)


def thud(f=70, d=0.6):
    t = t_axis(d)
    freq = f * (1 + 1.6 * np.exp(-t / 0.025))
    x = np.sin(2 * np.pi * np.cumsum(freq) / SR) * exp_env(len(t), 0.16)
    n = lp(noise(d), 1800) * exp_env(len(t), 0.03) * 0.5
    return x + n


def stamp():
    x = thud(95, 0.5)
    crack = bp(noise(0.08), 800, 5000) * exp_env(int(0.08 * SR), 0.012)
    x[: len(crack)] += crack * 0.9
    return x


def riser(d=2.6):
    t = t_axis(d)
    u = t / d
    x = swept_filter_noise(d, 400, 9000, q=1.6, curve=1.8) * (u ** 2.2)
    tone = sum(np.sin(2 * np.pi * np.cumsum(f * (1 + 1.0 * u ** 2)) / SR) for f in (220, 330.0, 440.5)) * 0.12 * u ** 2
    return x + tone


def impact(d=3.2):
    t = t_axis(d)
    sub = np.sin(2 * np.pi * np.cumsum(42 * (1 + 2.5 * np.exp(-t / 0.05))) / SR) * exp_env(len(t), 0.9)
    body = lp(noise(d), 900) * exp_env(len(t), 0.25) * 0.6
    air = hp(noise(d), 3000) * exp_env(len(t), 0.5) * 0.15
    chord = bell([146.8, 220.0, 293.7, 440.0], d=d, tau=1.4, bright=0.6) * 0.35
    return sub + body + air + chord


def shimmer(d=1.4):
    t = t_axis(d)
    x = np.zeros_like(t)
    for i, f in enumerate([1760, 2217, 2637, 3520, 2960]):
        start = int(i * 0.07 * SR)
        seg = np.sin(2 * np.pi * f * t[: len(t) - start]) * exp_env(len(t) - start, 0.35)
        x[start:] += seg * 0.4
    x += hp(noise(d), 6000) * exp_env(len(t), 0.4) * 0.15
    return x


def freeze():
    d = 1.3
    x = shimmer(d) * 0.8
    crackle = np.zeros(int(d * SR))
    for k in range(26):
        pos = int(rng.uniform(0, 0.9) * SR)
        c = hp(noise(0.01), 3000) * exp_env(int(0.01 * SR), 0.002) * rng.uniform(0.3, 1.0)
        crackle[pos:pos + len(c)] += c
    return x + crackle * 0.8


def crunch():
    d = 1.0
    t = t_axis(d)
    grind = bp(noise(d), 120, 1400) * (np.abs(np.sin(2 * np.pi * 23 * t)) ** 3) * env_adsr(len(t), 0.05, 0.2, 0.7, 0.4, 0.3)
    low = np.sin(2 * np.pi * np.cumsum(90 - 40 * t / d) / SR) * env_adsr(len(t), 0.05, 0.2, 0.8, 0.4, 0.3)
    return grind * 0.7 + low * 0.6


def typing(d=1.6, rate=13):
    x = np.zeros(int(d * SR))
    tt = 0.0
    while tt < d - 0.05:
        k = hp(noise(0.03), 1500 + rng.uniform(-300, 600)) * exp_env(int(0.03 * SR), 0.004)
        body = lp(noise(0.03), 900) * exp_env(int(0.03 * SR), 0.008) * 0.6
        pos = int(tt * SR)
        x[pos:pos + len(k)] += (k + body) * rng.uniform(0.4, 1.0)
        tt += rng.uniform(0.6, 1.4) / rate
    return x


def water_loop(d=12.0):
    """Seamless-ish waterfall ambience: layered filtered noise with slow modulation."""
    t = t_axis(d)
    l = lp(noise(d), 700) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.13 * t))
    m = bp(noise(d), 700, 3500) * (0.5 + 0.15 * np.sin(2 * np.pi * 0.21 * t + 1))
    h = hp(noise(d), 4000) * 0.12
    bub = np.zeros_like(t)
    for _ in range(int(d * 9)):
        pos = int(rng.uniform(0, d - 0.1) * SR)
        f = rng.uniform(500, 1600)
        n = int(0.05 * SR)
        tt = np.arange(n) / SR
        bub[pos:pos + n] += np.sin(2 * np.pi * np.cumsum(f * (1 + 2 * tt / 0.05)) / SR) * exp_env(n, 0.012) * 0.25
    mono_a = l + m + h + bub
    mono_b = np.roll(l, 4800) + np.roll(m, 9000) + h + np.roll(bub, 7000)
    x = np.stack([mono_a, mono_b], axis=1)
    # crossfade end into start for a clean loop
    xf = int(1.0 * SR)
    fade = np.linspace(0, 1, xf)[:, None]
    x[:xf] = x[:xf] * fade + x[-xf:] * (1 - fade)
    return x[:-xf]


def page_flip():
    d = 0.35
    x = swept_filter_noise(d, 1500, 5000, q=1.5) * np.sin(np.pi * t_axis(d) / d) ** 2
    return x


def heartbeat_tick():
    """Clock tick for deadline pressure."""
    a = tick(1800) * 0.8
    b = tick(1500) * 0.6
    gap = int(0.5 * SR)
    x = np.zeros(gap * 2)
    x[: len(a)] += a
    x[gap:gap + len(b)] += b
    return x


def gate_close():
    d = 0.7
    t = t_axis(d)
    slide = bp(noise(d), 300, 2500) * env_adsr(len(t), 0.02, 0.2, 0.3, 0.2, 0.1) * 0.5
    clank = bell([310, 470], d=d, tau=0.18, bright=1.6) * 0.5
    x = slide
    off = int(0.18 * SR)
    x[off:] += clank[: len(x) - off]
    x[off:off + int(0.4 * SR)] += thud(80, 0.4)[: int(0.4 * SR)] * 0.8
    return x


def switch_click():
    """Toggle switch: a soft mechanical click pair (press / latch)."""
    d = 0.22
    n = int(d * SR)
    x = np.zeros(n)
    for off, f, a in ((0.0, 3200, 0.9), (0.055, 2100, 0.6)):
        k = int(off * SR)
        m = int(0.03 * SR)
        burst = bp(noise(0.03), f * 0.6, f * 1.6) * exp_env(m, 0.004)
        x[k:k + m] += a * burst[: n - k]
    x += 0.25 * np.sin(2 * np.pi * 180 * t_axis(d)) * exp_env(n, 0.02)
    return st(x, 0.0, 0.0)


def data_send(d=1.1):
    """Configuration update in flight: airy sweep with a soft sparkle."""
    tt = t_axis(d)
    sweep = swept_filter_noise(d, 500, 4200, q=4.0) * np.sin(np.pi * tt / d) ** 1.5 * 0.5
    sparkle = sum(np.sin(2 * np.pi * f * tt) * exp_env(len(tt), 0.35) * 0.08 for f in (1760, 2637, 3520))
    fade = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 0.5
    return st(sweep + sparkle * fade, -0.5, 0.3)


def arrive():
    """Configuration received: two-note soft glass ping."""
    return bell([1318.5, 1975.5], d=0.9, tau=0.25, bright=0.7)


def main():
    save("whoosh", whoosh(), -8)
    save("whoosh_fast", whoosh(0.4, 600, 6000, -0.3, 0.8), -10)
    save("whoosh_low", whoosh(1.1, 150, 1200, 0.6, -0.6), -8)
    save("pop", pop(), -10, rev=0.12)
    save("pop_hi", pop(1240, 0.12), -11, rev=0.12)
    save("pop_lo", pop(520, 0.2), -10, rev=0.12)
    save("tick", tick(), -14, rev=0.08)
    save("chime", chime_success(), -11)
    save("bug", bug_blip(), -11, rev=0.1)
    save("thud", thud(), -8)
    save("shimmer", shimmer(), -14, rev=0.3)
    save("switch", switch_click(), -8, rev=0.1)
    save("data", data_send(), -12, rev=0.2)
    save("arrive", arrive(), -14, rev=0.25)


if __name__ == "__main__":
    main()
