#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

required = [
    "default.project.json",
    "rokit.toml",
    "src/ServerScriptService/ServerBootstrap.server.luau",
    "src/StarterPlayer/StarterPlayerScripts/ClientBootstrap.client.luau",
    "src/ReplicatedStorage/Shared/Net/Protocol.luau",
    "docs/ARCHITECTURE.md",
    "docs/SECURITY.md",
]
for rel in required:
    if not (ROOT / rel).exists(): errors.append(f"missing: {rel}")

try:
    project = json.loads((ROOT / "default.project.json").read_text())
    workspace = project["tree"]["Workspace"]["$properties"]
    assert workspace["StreamingEnabled"] is True
    assert workspace["StreamingIntegrityMode"] == "PauseOutsideLoadedArea"
    assert workspace["ModelStreamingBehavior"] == "Improved"
except Exception as exc:
    errors.append(f"project configuration invalid: {exc}")

luau_files = list((ROOT / "src").rglob("*.luau"))
if len(luau_files) < 20: errors.append(f"expected >=20 Luau files, found {len(luau_files)}")
for path in luau_files:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("--!strict"):
        errors.append(f"strict mode missing: {path.relative_to(ROOT)}")
    if "require(" in text and "http://" in text:
        errors.append(f"remote require prohibited: {path.relative_to(ROOT)}")
    if re.search(r"require\s*\(\s*\d+\s*\)", text):
        errors.append(f"asset-id require prohibited: {path.relative_to(ROOT)}")
    if "TODO: SECURITY" in text:
        errors.append(f"unresolved security TODO: {path.relative_to(ROOT)}")

protocol = (ROOT / "src/ReplicatedStorage/Shared/Net/Protocol.luau").read_text()
for name in ["RequestInteraction", "RequestExpedition", "ResolveEncounter", "StateChanged"]:
    if name not in protocol: errors.append(f"remote missing from protocol: {name}")

if errors:
    print("Roblox foundation validation failed:")
    for error in errors: print(f" - {error}")
    sys.exit(1)
print(f"Validated {len(luau_files)} strict Luau files and streaming project configuration.")
