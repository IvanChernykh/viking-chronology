# Architecture

## Authority model

The client requests intent; the server validates and mutates state. The client never awards resources, unlocks regions, completes expeditions or decides interaction range.

```text
Client input/UI
    ↓ intent
Validated RemoteEvents → RateLimiter → Server services
    ↓                                      ↓
Camera/audio feedback              PlayerData / Expedition / World / NPC
                                           ↓
                                    DataStore + replicated snapshots
```

## Service responsibilities

| Service | Responsibility |
|---|---|
| `RemoteService` | Creates the named network surface in one folder. |
| `PlayerDataService` | Loads, reconciles, autosaves and persists player state. |
| `WorldService` | Region definitions, anchors, unlocks and replication focus. |
| `ExpeditionService` | Planning-to-completion state machine and rewards. |
| `InteractionService` | Server distance validation for tagged interactables. |
| `NPCService` | Activation radius, pathfinding and simulation throttling. |
| `TelemetryService` | Non-fatal analytics hooks. |

## Network contract

All inbound payloads are size/type validated. Requests are rate-limited per user. Gameplay mutation happens only after server checks. New remotes must be added to `Shared/Net/Protocol.luau` and documented in `docs/SECURITY.md`.

## Streaming model

The world is divided into authored regions and smaller art cells. Persistent gameplay state is data, not streamed Instances. Scripts must tolerate streamed objects leaving `Workspace` and returning later. The player character remains the primary replication focus; temporary additional foci are reserved for controlled cinematics or ship transitions.
