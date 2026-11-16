# Inventory (generated — do not edit)

Read it BEFORE adding a component, helper, cue or tool: does it already exist?
Regenerate with `python tools/maps/update_maps.py`; `python -m unittest discover -s tests` fails when it drifts.

## Tools (`tools`)

### tools/finalize.py

_Master the rendered video: two-pass EBU R128 loudness normalisation of the_

| name | kind | doc |
|---|---|---|
| `OUT` | const |  |
| `TARGET` | const |  |
| `run` | function |  |
| `main` | function |  |

### tools/make_srt.py

_Build broadcast-style subtitles from the word-level timeline._

| name | kind | doc |
|---|---|---|
| `TIMELINE` | const |  |
| `OUT` | const |  |
| `MAX_CHARS` | const |  |
| `LINE` | const |  |
| `MIN_DUR` | const |  |
| `ts` | function |  |
| `cues_for` | function |  |
| `main` | function |  |

### tools/maps/inventory.py

_Generate docs/maps/inventory.md: every top-level declaration of the project,_

| name | kind | doc |
|---|---|---|
| `ROOT` | const |  |
| `LARGE` | const |  |
| `HEADER` | const |  |
| `first_line` | function |  |
| `cell` | function |  |
| `python_section` | function |  |
| `large_files` | function |  |
| `generate` | function |  |
| `tree_complete` | function |  |

### tools/maps/update_maps.py

_Regenerate every map and print what moved (full diff when 40 lines or fewer)._

| name | kind | doc |
|---|---|---|
| `ROOT` | const |  |
| `MAPS` | const |  |
| `main` | function |  |

### tools/music_gen.py

_Generate music with Lyria via streamed chat completions (audio output)._

| name | kind | doc |
|---|---|---|
| `lyria` | function |  |

### tools/openrouter.py

_Small OpenRouter helpers used by the asset-generation tools._

| name | kind | doc |
|---|---|---|
| `ROOT` | const |  |
| `_load_env` | function |  |
| `API_KEY` | const |  |
| `BASE_URL` | const |  |
| `HEADERS` | const |  |
| `ClientError` | class | A 4xx response: retrying will not help. |
| `_retry` | function |  |
| `speech` | function | Text-to-speech through /audio/speech. Returns the written file path. |
| `chat` | function | Plain chat completion, returns the parsed JSON response. |
| `audio_part` | function |  |
| `image_part` | function |  |

### tools/qa_audio.py

_Audio QA of a render: peak, and how far the music + effects bed sits under the_

| name | kind | doc |
|---|---|---|
| `ROOT` | const |  |
| `SR` | const |  |
| `read` | function |  |
| `db` | function |  |
| `main` | function |  |

### tools/qa_invariance.py

_Acceptance check 8: the deployed software stays pixel-identical while the flag_

| name | kind | doc |
|---|---|---|
| `ROOT` | const |  |
| `AA_TOLERANCE` | const |  |
| `BOX` | const |  |
| `word_time` | function |  |
| `main` | function |  |

### tools/review_video.py

_Ask a video-capable model for a critical creative review of a rendered clip._

| name | kind | doc |
|---|---|---|
| `MODEL` | const |  |
| `PROMPT` | const |  |
| `main` | function |  |

### tools/sfx.py

_Procedurally synthesised sound-design kit (48 kHz stereo WAV)._

| name | kind | doc |
|---|---|---|
| `ROOT` | const |  |
| `OUT` | const |  |
| `SR` | const |  |
| `t_axis` | function |  |
| `noise` | function |  |
| `bp` | function |  |
| `lp` | function |  |
| `hp` | function |  |
| `env_adsr` | function |  |
| `exp_env` | function |  |
| `swept_filter_noise` | function | Noise through a time-varying band-pass (block-wise). |
| `_IR` | const |  |
| `reverb` | function |  |
| `st` | function | Mono -> stereo with constant-power pan and optional Haas width. |
| `save` | function |  |
| `whoosh` | function |  |
| `pop` | function |  |
| `tick` | function |  |
| `bell` | function |  |
| `chime_success` | function |  |
| `soft_error` | function |  |
| `bug_blip` | function |  |
| `thud` | function |  |
| `stamp` | function |  |
| `riser` | function |  |
| `impact` | function |  |
| `shimmer` | function |  |
| `freeze` | function |  |
| `crunch` | function |  |
| `typing` | function |  |
| `water_loop` | function | Seamless-ish waterfall ambience: layered filtered noise with slow modulation. |
| `page_flip` | function |  |
| `heartbeat_tick` | function | Clock tick for deadline pressure. |
| `gate_close` | function |  |
| `switch_click` | function | Toggle switch: a soft mechanical click pair (press / latch). |
| `data_send` | function | Configuration update in flight: airy sweep with a soft sparkle. |
| `arrive` | function | Configuration received: two-note soft glass ping. |
| `main` | function |  |

### tools/sheet.py

_Labelled contact sheets (3 columns, 12 stills per sheet) for visual QA._

| name | kind | doc |
|---|---|---|
| `main` | function |  |

### tools/tts_build.py

_Build the narration track from script/narration.json._

| name | kind | doc |
|---|---|---|
| `LANG` | const |  |
| `SCRIPT` | const |  |
| `TAKES` | const |  |
| `suffix` | function |  |
| `PUBLIC` | const |  |
| `DATA` | const |  |
| `OUTPUT` | const |  |
| `SR` | const |  |
| `JUDGE_MODEL` | const |  |
| `read_wav` | function |  |
| `write_wav` | function |  |
| `to48k` | function |  |
| `trim` | function | Strip leading/trailing silence. Returns (audio, seconds removed from the start). |
| `speech_rms` | function |  |
| `NUMBERS` | const |  |
| `norm_words` | function |  |
| `wer` | function |  |
| `_add_cuda_dlls` | function | pip-installed nvidia-* wheels ship their DLLs in site-packages/nvidia/*/bin. |
| `asr` | function |  |
| `GLOSSARY` | const |  |
| `GLOSSARY_FR` | const |  |
| `transcribe` | function |  |
| `align_words` | function | Map every script word onto ASR word timings (interpolating gaps). |
| `seg_style` | function |  |
| `take_path` | function |  |
| `gen_take` | function |  |
| `judge` | function |  |
| `main` | function |  |

## Animation sources (`video/src`)

### video/src/Animatic.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Beat` | type |  | Animatic: grey placeholder blocks driven by the same cue table as the final |
| `BEATS` | array |  |  |
| `Block` | function |  |  |
| `Animatic` | function | yes |  |

### video/src/Main.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Main` | function | yes |  |

### video/src/Root.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `RemotionRoot` | function | yes |  |

### video/src/components/AppBox.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `BOX_W` | const | yes | Native size of the software box and the anchor points other layers attach to. |
| `BOX_H` | const | yes |  |
| `ROW_A_Y` | const | yes |  |
| `ROW_B_Y` | const | yes |  |
| `JUNCTION` | object | yes |  |
| `ROW_X` | const | yes |  |
| `Props` | type |  |  |
| `Row` | function |  |  |
| `AppBox` | function | yes | The software: one opaque package holding the possible behaviours. |

### video/src/components/Background.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Background` | function | yes | Global backdrop: deep gradient, slow light orbs (one per idea colour), dot grid, grain, vignette. |

### video/src/components/Dashboards.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `SCREEN_W` | const | yes | The two behaviours of the bank application, drawn at a native 300 x 600 |
| `SCREEN_H` | const | yes |  |
| `rows` | array |  |  |
| `OldDashboard` | function | yes |  |
| `NewDashboard` | function | yes |  |
| `Thumb` | function | yes | Miniature of a dashboard, used inside the software package. |

### video/src/components/LDPanel.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `LD_W` | const | yes |  |
| `LD_H` | const | yes |  |
| `LD_SWITCH` | object | yes | Where the flag switch sits inside the panel (for the cursor and the link). |
| `LDPanel` | function | yes | LaunchDarkly as an external control panel: it holds the flag's configuration, |

### video/src/components/Music.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Cue` | type |  | gain: [time(s), gain] keyframes, linearly interpolated (times are absolute). |
| `gainAt` | function |  |  |
| `DUCK` | const |  | Music bed: one cue per act, crossfaded, and ducked under the narration |
| `ATTACK` | const |  |  |
| `RELEASE` | const |  |  |
| `speechCache` | const |  |  |
| `speech` | function |  |  |
| `duckAt` | function | yes |  |
| `Music` | function | yes |  |

### video/src/components/Phone.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `PHONE_W` | const | yes |  |
| `PHONE_H` | const | yes |  |
| `Phone` | function | yes | The user's screen. `k` cross-slides from the current dashboard (0) to the new |

### video/src/components/Sfx.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Cue` | type |  | Sound design: one subtle effect per state change, never on top of a key word. |
| `SFX` | function | yes |  |
| `Sfx` | function | yes |  |

### video/src/components/ui.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Icon` | object | yes | Simple vector icons, drawn for this film (no third-party logos). |
| `Avatar` | function | yes | Flat person bust inside a ring; `color` codes the role. |
| `Switch` | function | yes | iOS-like switch. `k` = 0 (off) .. 1 (on). |
| `Label` | function | yes |  |
| `mix` | function | yes | Hex colour interpolation. |

### video/src/index.ts

_(no top-level declarations)_

### video/src/lib/anim.ts

| name | kind | exported | doc |
|---|---|---|---|
| `clamp01` | function | yes |  |
| `ease` | object | yes |  |
| `p` | function | yes | 0..1 progress of an animation that starts at `start` (s) and lasts `dur` (s). |
| `env` | function | yes | In-then-out envelope: rises at `a`, falls at `b`. |
| `lerp` | function | yes |  |
| `map` | function | yes |  |
| `spring` | function | yes | Damped spring 0 -> 1 (with overshoot) evaluated analytically from time since start. |
| `rand` | function | yes | Deterministic pseudo random in [0,1) from an integer seed. |

### video/src/lib/cues.ts

| name | kind | exported | doc |
|---|---|---|---|
| `Q` | object | yes | Every story event of the film, in global seconds, anchored on the words of the |
| `CueName` | type | yes |  |

### video/src/lib/geom.ts

| name | kind | exported | doc |
|---|---|---|---|
| `Pt` | type | yes |  |
| `Bez` | type | yes |  |
| `bez` | function | yes | Point on a cubic Bézier at u in [0,1]. |
| `bezPath` | function | yes |  |
| `rev` | function | yes |  |
| `Cam` | type | yes | Camera key: world point (cx, cy) shown at the centre of the frame at scale s. |
| `camAt` | function | yes | Piecewise camera: holds each key, eases between consecutive keys over [t0, t1]. |

### video/src/lib/story.ts

| name | kind | exported | doc |
|---|---|---|---|
| `DEMO` | const | yes | Start of the quick final demonstration (same software, two behaviours). |
| `FLIPS` | array | yes | Switch flips in LaunchDarkly: [time, new value]. |
| `TRIPS` | array | yes | Configuration updates travelling LaunchDarkly -> application (only when it changes). |
| `EVALS` | array | yes | Evaluations: the user opens the dashboard (tap), the app evaluates, the screen shows the result. |
| `switchK` | function | yes |  |
| `memValue` | function | yes | Flag value currently held in the application's memory. |
| `screenAt` | function | yes | What the user's screen shows: `under` + slide progress `k` toward the other one. |

### video/src/lib/time.ts

| name | kind | exported | doc |
|---|---|---|---|
| `Lang` | type | yes |  |
| `Word` | type | yes |  |
| `Segment` | type | yes |  |
| `Scene` | type | yes |  |
| `Timeline` | type |  |  |
| `LANG` | const | yes |  |
| `TL` | const | yes |  |
| `SEGS` | const |  |  |
| `SCENES` | const |  |  |
| `scene` | function | yes |  |
| `seg` | function | yes |  |
| `clean` | function |  |  |
| `w` | function | yes | Time (global seconds) of a word or phrase inside a segment. Words are matched |
| `useT` | function | yes | Current global time in seconds. |
| `OffsetCtx` | const | yes | Sequences reset the frame counter; this context restores global time. |
| `WithOffset` | function | yes |  |

### video/src/scenes/Opening.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Opening` | function | yes | Series title over the opening close-up of the phone (screen space). |

### video/src/scenes/Recap.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `Pill` | function |  | S5: the two-line mental model above the (shrunken, same) stage, then the |
| `Arrow` | function |  |  |
| `RowLabel` | function |  |  |
| `Recap` | function | yes |  |

### video/src/scenes/Stage.tsx

| name | kind | exported | doc |
|---|---|---|---|
| `BOX` | object | yes |  |
| `PKG` | object |  |  |
| `LD` | object |  |  |
| `PHONE` | object |  |  |
| `TAG` | object |  |  |
| `MAIN_Y` | const |  |  |
| `LANE_A` | array |  |  |
| `LANE_B` | array |  |  |
| `LINK` | array |  |  |
| `BRANCH_OUT` | array |  |  |
| `BRANCH_IN` | array |  |  |
| `CARD_PATH` | array |  |  |
| `CAM0` | object |  |  |
| `camKeys` | function |  |  |
| `fadeIO` | function |  |  |
| `Dot` | function |  |  |
| `Lane` | function |  |  |
| `Cursor` | function |  |  |
| `Brackets` | function |  | Corner brackets drawn just outside a rectangle. |
| `Chip` | function |  |  |
| `Stage` | function | yes |  |

### video/src/theme.ts

| name | kind | exported | doc |
|---|---|---|---|
| `fonts` | object | yes |  |
| `C` | object | yes | Design tokens. One colour per idea, constant for the whole film: |
| `W` | const | yes |  |
| `H` | const | yes |  |
| `FPS` | const | yes |  |

## Large files (> 300 lines, rounded down to 50)

- `tools/sfx.py`: 350+ lines
- `tools/tts_build.py`: 350+ lines
- `video/src/scenes/Stage.tsx`: 350+ lines
