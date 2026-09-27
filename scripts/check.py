#!/usr/bin/env python3
"""Checks the plugin before a release (run by CI, and by hand: python3 scripts/check.py).

- the plugin and marketplace manifests parse, carry their required fields, and agree on the plugin name
- every skills/<name>/SKILL.md has a front matter with `name` (equal to its folder) and `description`
- every JSON file of the repository parses
- no text file holds a long dash, or an absolute path of a home or volume folder
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
errors: list[str] = []

# Built from pieces so that this file does not match its own patterns.
DASHES = {chr(0x2014): "em dash", chr(0x2013): "en dash", chr(0x2015): "horizontal bar"}
MACHINE_PATH = re.compile("(/" + "Users/|/" + "Volumes/|/" + "home/[a-z]|[A-Z]:[\\\\/]" + "Users)")
TEXT = {".md", ".json", ".ts", ".tsx", ".mjs", ".py", ".sh", ".yml", ".yaml", ".txt", ""}


def load(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        errors.append(f"{path.relative_to(ROOT)}: {error}")
        return {}


def front_matter(path: Path) -> dict[str, str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---" or "---" not in lines[1:]:
        errors.append(f"{path.relative_to(ROOT)}: no front matter between --- lines")
        return {}
    fields = {}
    for line in lines[1:lines.index("---", 1)]:
        key, _, value = line.partition(":")
        if value:
            fields[key.strip()] = value.strip()
    return fields


def tracked_files() -> list[Path]:
    try:
        out = subprocess.run(["git", "ls-files", "-co", "--exclude-standard"], cwd=ROOT, capture_output=True,
                             text=True, check=True).stdout
        return [ROOT / name for name in out.splitlines() if (ROOT / name).is_file()]
    except (OSError, subprocess.CalledProcessError):
        return [p for p in ROOT.rglob("*") if p.is_file() and "node_modules" not in p.parts and ".git" not in p.parts]


def main() -> None:
    plugin = load(ROOT / ".claude-plugin" / "plugin.json")
    market = load(ROOT / ".claude-plugin" / "marketplace.json")
    for key in ("name", "version", "description", "license"):
        if not plugin.get(key):
            errors.append(f"plugin.json: missing {key}")
    for key in ("name", "owner", "plugins"):
        if not market.get(key):
            errors.append(f"marketplace.json: missing {key}")
    entries = {entry.get("name"): entry for entry in market.get("plugins", [])}
    if plugin.get("name") not in entries:
        errors.append(f"marketplace.json: no entry named {plugin.get('name')!r} (the name in plugin.json)")
    for name, entry in entries.items():
        source = entry.get("source")
        if isinstance(source, str) and (not source.startswith("./") or ".." in source):
            errors.append(f"marketplace.json: {name}: a relative source starts with ./ and has no ..")

    skills = sorted((ROOT / "skills").glob("*/SKILL.md"))
    if not skills:
        errors.append("skills/: no <name>/SKILL.md")
    for path in skills:
        fields = front_matter(path)
        folder = path.parent.name
        if fields.get("name") != folder:
            errors.append(f"{path.relative_to(ROOT)}: name {fields.get('name')!r} differs from its folder {folder!r}")
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", fields.get("name", "")):
            errors.append(f"{path.relative_to(ROOT)}: name must be lowercase words joined by hyphens")
        description = fields.get("description", "")
        if len(description) < 40:
            errors.append(f"{path.relative_to(ROOT)}: description missing or too short to trigger the skill")
        if len(description) > 1536:
            errors.append(f"{path.relative_to(ROOT)}: description over 1,536 characters is cut in the skill list")

    for path in tracked_files():
        if path.suffix == ".json":
            load(path)
        if path.suffix not in TEXT:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for number, line in enumerate(text.splitlines(), 1):
            for char, label in DASHES.items():
                if char in line:
                    errors.append(f"{path.relative_to(ROOT)}:{number}: {label}")
            if MACHINE_PATH.search(line):
                errors.append(f"{path.relative_to(ROOT)}:{number}: absolute path of a machine")

    if errors:
        print("\n".join(errors))
        sys.exit(f"check.py: {len(errors)} problem(s)")
    print(f"check.py: plugin, marketplace, {len(skills)} skill(s) and every tracked file look right")


if __name__ == "__main__":
    main()
