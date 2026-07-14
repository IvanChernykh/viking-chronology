# Viking Chronology — Roblox Open-World Track

The repository now contains two deliberately separated products:

1. **Web V4 historical vertical slice** — deployed through GitHub Pages.
2. **Roblox production foundation** — a streaming-first, server-authoritative Luau/Rojo codebase intended for a substantially larger world.

## Open the foundation

- [Roblox package](roblox/README.md)
- [Architecture](roblox/docs/ARCHITECTURE.md)
- [World production plan](roblox/docs/WORLD_PRODUCTION_PLAN.md)
- [Mobile performance budgets](roblox/docs/MOBILE_PERFORMANCE.md)
- [Asset and licensing pipeline](roblox/docs/ASSET_PIPELINE.md)
- [Historical content pipeline](roblox/docs/HISTORICAL_CONTENT_PIPELINE.md)
- [Security contract](roblox/docs/SECURITY.md)
- [Roblox Studio setup](roblox/docs/ROBLOX_STUDIO_SETUP.md)
- [Production roadmap](roblox/docs/ROADMAP.md)

## Implemented engineering baseline

- ten-region world graph from Scandinavia to the western horizon;
- Roblox Instance Streaming configuration;
- server-authoritative expedition state machine and encounters;
- persistent profiles with retry, autosave and shutdown saves;
- validated remotes, rate limiting and server-side distance checks;
- NPC activation budgets and PathfindingService;
- settlement, dialogue and voyage camera modes;
- custom streaming-pause UX, touch actions and HUD foundation;
- audio buses ready for licensed ambience, score and dialogue;
- pinned Rojo, StyLua and Selene toolchain;
- GitHub Actions validation and downloadable `.rbxlx` build artifact.

## Honest production boundary

This is not a finished GTA-scale experience and does not pretend to be one. A large polished game still requires Roblox Studio world construction, terrain, optimized art, rigs, animations, professional audio and voice, historical/linguistic review, multiplayer QA, device certification and publication to a Roblox universe.

The purpose of this track is to make that production technically possible without inheriting the architectural limits of the web prototype.
