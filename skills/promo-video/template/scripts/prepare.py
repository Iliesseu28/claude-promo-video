#!/usr/bin/env python3
"""Synthesizes the sounds of the promo video into public/gen (ignored by git):

  click.wav  a short, soft mouse click
  drop.wav   a softer one, for the end of a drag
  pad.wav    a very quiet chord under the voice, exactly as long as the video (src/video.json)

Everything is generated here: no sample, no music from elsewhere. Python 3 standard library only.
"""

from __future__ import annotations

import json
import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "gen"
RATE = 48_000


def write_wav(path: Path, left: list[float], right: list[float]) -> None:
    frames = bytearray()
    for a, b in zip(left, right):
        frames += struct.pack("<hh", round(max(-1, min(1, a)) * 32767), round(max(-1, min(1, b)) * 32767))
    with wave.open(str(path), "wb") as file:
        file.setnchannels(2)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes(bytes(frames))


def click(path: Path, gain: float, pitch: float) -> None:
    """A trackpad-like tick: a few milliseconds of filtered noise over a damped high tone."""
    rng = random.Random(7)  # a fixed seed: the same click at every run
    count = int(RATE * 0.045)
    samples, low = [], 0.0
    for index in range(count):
        t = index / RATE
        low += 0.35 * (rng.uniform(-1, 1) - low)  # one-pole low-pass: takes the hiss off the noise
        body = math.sin(2 * math.pi * pitch * t) * math.exp(-t * 260)
        snap = low * math.exp(-t * 900)
        samples.append(gain * (0.55 * body + 0.8 * snap))
    write_wav(path, samples, samples)


def pad(path: Path, seconds: float) -> None:
    """A soft major-ninth chord, slowly breathing, far under the voice before the final loudness pass."""
    notes = [130.81, 196.00, 329.63, 493.88, 587.33]  # C3 G3 E4 B4 D5
    count = int(RATE * seconds)
    left, right = [0.0] * count, [0.0] * count
    for number, frequency in enumerate(notes):
        pan = 0.5 + 0.35 * math.sin(number * 2.1)
        detune = 1.0 + 0.0015 * (number % 2 * 2 - 1)
        weight = 0.22 / (1 + number * 0.35)
        for index in range(count):
            t = index / RATE
            swell = 0.75 + 0.25 * math.sin(2 * math.pi * t / (7 + number) + number)
            value = weight * swell * (math.sin(2 * math.pi * frequency * t)
                                      + 0.5 * math.sin(2 * math.pi * frequency * detune * t))
            left[index] += value * (1 - pan)
            right[index] += value * pan
    fade_in, fade_out = int(RATE * 2.5), int(RATE * 3.0)
    for index in range(count):
        envelope = min(1.0, index / fade_in, (count - index) / fade_out)
        envelope = envelope * envelope * (3 - 2 * envelope)
        left[index] *= 0.16 * envelope
        right[index] *= 0.16 * envelope
    write_wav(path, left, right)


def main() -> None:
    video = json.loads((ROOT / "src" / "video.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    click(OUT / "click.wav", gain=0.5, pitch=2400)
    click(OUT / "drop.wav", gain=0.35, pitch=900)
    # The pad lasts exactly as long as the video: a longer one is cut dead on the last frame.
    pad_path = OUT / "pad.wav"
    stamp = OUT / "pad.seconds"
    if not pad_path.exists() or not stamp.exists() or stamp.read_text() != str(video["duration"]):
        pad(pad_path, seconds=float(video["duration"]))
        stamp.write_text(str(video["duration"]))
    print(f"prepared {', '.join(sorted(p.name for p in OUT.glob('*.wav')))}")


if __name__ == "__main__":
    main()
