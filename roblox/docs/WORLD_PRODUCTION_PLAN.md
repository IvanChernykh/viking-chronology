# World Production Plan

## Target structure

The game is one historical world presented through multiple Places or large streamed regions. The starter Place contains Scandinavia and the North Sea transition. Distant chapters can move to separate Places when memory, iteration speed or team ownership requires it.

## Region cell standard

- Art cell: 256×256 studs for settlements and dense coasts.
- Landscape cell: 512×512 studs for wilderness and sea approaches.
- Terrain authored continuously; props grouped into streamable Models.
- Settlement landmark models use `Atomic` only when partial loading would break them.
- Persistent models are exceptional and require performance review.
- Distant silhouettes use terrain, low-detail meshes or engine LOD—not hidden full-detail duplicates.

## Scandinavia vertical slice

1. Fjord entrance and navigable water.
2. Settlement of 20–35 buildings with three social zones.
3. Shipyard with repair loop and launch sequence.
4. Forest, quarry, fields and shoreline resource routes.
5. 30 ambient NPCs with only nearby agents fully simulated.
6. One longship with server-owned expedition movement.
7. One 20–30 minute chapter ending at the North Sea threshold.

## Density targets

| Layer | Starter target |
|---|---:|
| Unique hero buildings | 8–12 |
| Modular building variants | 25+ |
| Prop kit | 120+ optimized assets |
| Named NPCs | 12 |
| Ambient NPC pool | 40–60 |
| Wildlife archetypes | 6–8 |
| Interactive historical objects | 25+ |
| Encounter variants | 12+ |

## Gates before expansion

Do not begin Britain until Scandinavia passes:

- stable 30 FPS on low-end mobile target;
- no streaming integrity stalls during normal traversal;
- save/load recovery tests;
- complete first chapter with no blocked state;
- historical and material-culture review;
- animation and audio review;
- 30-minute multiplayer soak test.
