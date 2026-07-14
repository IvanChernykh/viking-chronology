# Mobile Performance Budget

## Device profiles

| Profile | Target | Frame target | Notes |
|---|---|---:|---|
| Battery | low-memory Android/iPhone | 30 FPS | aggressive LOD, no decorative shadows |
| Balanced | mainstream mobile/tablet | 30–45 FPS | standard vegetation and NPC ranges |
| High | desktop/console/high-end mobile | 60 FPS | extended draw distance and effects |

## Budgets per streamed dense cell

- visible triangles: 250k Battery / 500k Balanced / 1.2m High;
- active animated humanoids: 8 / 16 / 28;
- server-simulated nearby NPCs per player area: 12–20;
- transparent layers: minimize overlapping particles and foliage cards;
- texture memory: atlases, shared trims and controlled resolution tiers;
- moving physical assemblies: few, compact and server-reviewed;
- no unbounded loops or per-frame `GetDescendants()` scans.

## Test matrix

- touch camera and HUD conflict;
- StreamingIntegrity pause behavior;
- background/resume after OS interruption;
- memory after 20 minutes of travel;
- repeated region transitions;
- high latency and packet loss;
- device thermal throttling;
- UI safe areas and localization expansion.
