# Roblox Studio Setup

1. Create a new unpublished test experience.
2. In Studio, enable Team Create for production collaboration.
3. Install Rojo and connect `rojo serve`.
4. Confirm Workspace properties from `default.project.json`:
   - `StreamingEnabled = true`
   - `ModelStreamingBehavior = Improved`
   - `StreamingIntegrityMode = PauseOutsideLoadedArea`
   - `StreamingMinRadius = 64`
   - `StreamingTargetRadius = 1024`
   - `StreamOutBehavior = Opportunistic`
5. Keep Studio API access disabled in the live universe. Use a separate test universe for DataStore tests.
6. Create tags with CollectionService for `Interactable`, region assets and NPCs.
7. Replace blank audio IDs only with licensed uploaded assets.
8. Publish test Places only after CI and local multiplayer tests pass.

## Required Studio content

Code cannot generate production art. Add terrain, placed models, rigs, Animation objects, Sound objects and region spawn points in Studio, then sync scripts/configuration through Rojo.
