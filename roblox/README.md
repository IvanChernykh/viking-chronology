# Viking Chronology — Roblox Production Foundation

A server-authoritative Roblox/Luau foundation for a large historical open-world game about northern expeditions. This package is deliberately **not presented as a finished GTA-scale game**. It is the engineering baseline required before a large world, art production, animation, voice acting and historical content can be built safely.

## Delivered systems

- Rojo 7.7 project with strict Luau source layout.
- Streaming-first world configuration and ten-region world graph.
- Server-authoritative expedition state machine.
- Persistent player profiles with retries, autosave and shutdown saves.
- Validated RemoteEvents, rate limiting and distance checks.
- NPC activation budget and PathfindingService integration.
- Scriptable settlement, dialogue and voyage cameras.
- Custom streaming-pause screen.
- Touch-first interaction actions and responsive HUD foundation.
- Audio buses for ambience, music and dialogue.
- Historical-content, asset-license, mobile-budget and production-roadmap documents.
- CI that validates project structure, formats Luau and builds a `.rbxlx` place.

## World topology

| Region | Role | Unlock horizon |
|---|---|---:|
| Scandinavia | starter fjord, settlement, shipyard | 750 |
| North Sea | first maritime corridor | 780 |
| Britain | western campaigns and settlement | 793 |
| Frankia | trade, conflict and political integration | 820 |
| Baltic | eastern launch corridor | 800 |
| Eastern rivers | portage, trade and diplomacy | 860 |
| Byzantium | long-distance political/economic endpoint | 907 |
| Iceland | Atlantic settlement | 874 |
| Greenland | western settlement frontier | 985 |
| Western horizon | archaeologically constrained final chapter | c. 1000 |

## Local setup

1. Install [Rokit](https://github.com/rojo-rbx/rokit).
2. Run `rokit install` in this directory.
3. Install the Rojo Studio plugin with `rojo plugin install`.
4. Start sync with `rojo serve`.
5. Open a blank Roblox place and connect the plugin.
6. Build a file with `rojo build default.project.json --output build/VikingChronology.rbxlx`.

## Validation

```bash
python scripts/validate.py
stylua --check src
selene src
rojo build default.project.json --output build/VikingChronology.rbxlx
```

## Production rule

The `src` tree owns gameplay code and configuration. Roblox Studio owns terrain sculpting, meshes, animation assets, lighting iteration and placed content. Every imported asset must have an explicit license and source record. See `docs/ASSET_PIPELINE.md` and `docs/HISTORICAL_CONTENT_PIPELINE.md`.

## What remains human production work

- final terrain and region art;
- optimized meshes, materials and LODs;
- rigged characters and animation sets;
- professional music, ambience, foley and voice acting;
- historical review and linguistic review;
- Studio playtests on low-end Android, iPhone, tablet, desktop and console;
- publication to a Roblox universe and live DataStore testing.
