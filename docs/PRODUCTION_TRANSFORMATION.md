# Viking Chronology — production transformation

## Product target

The web build is treated as a high-fidelity playable vertical slice and systems laboratory, not as a promise that browser code alone can deliver an AAA content volume. The target is a historically grounded expedition RPG/strategy experience with reusable domain systems that can later move behind a Unity or Unreal presentation layer.

## Repository audit

### Current strengths

- evidence, confidence and sources are first-class historical data;
- the expedition loop already has planning, voyage, encounter and arrival phases;
- the renderer has explicit quality profiles and WebGL recovery;
- routes, dialogues and expedition chapters are data-driven;
- CI verifies TypeScript, lint, production assets, standalone compatibility and Pages deployment;
- a separate Roblox foundation already explores server-authoritative open-world architecture.

### Current constraints

1. `App.tsx` owns too many responsibilities: UI state, simulation timing, encounters, audio, dialogue and navigation.
2. `VikingScene.tsx` previously owned atmosphere, lighting, camera, composition and performance fallback in one module.
3. Terrain and water were visually static relative to voyage conditions.
4. The longship silhouette was constructed from capsule primitives and did not communicate clinker-built hull structure.
5. Resources are three independent percentages rather than an economy with mass, capacity, consumption and damage.
6. Encounters have immediate deltas but no delayed consequences, reputation, injuries or world-state changes.
7. There is no combat simulation, save schema, quest graph, dynasty model or content authoring contract.
8. World content density is hand-authored directly in renderer components instead of using region manifests and placement data.

## Transformation principles

### Domain before renderer

Rules that determine weather, resources, outcomes, reputation, combat and chronology must be pure TypeScript modules with serializable inputs and outputs. React and Three.js consume snapshots. They do not own the rules.

This makes later migration practical:

```text
historical data + simulation rules
              ↓
        serializable state
       ↙                 ↘
React / Three.js       Unity / Unreal
web vertical slice     future production client
```

### Historical evidence tiers

Every authored element must declare one of:

- `documented`: directly supported by a cited source;
- `probable`: supported by material culture or strong scholarly consensus;
- `reconstructed`: plausible connective material required by gameplay;
- `fictionalized`: named characters or incidents created for the narrative.

The interface must never present the last two tiers as documented events.

### Performance budgets are features

Every visual system requires `high`, `balanced` and `battery` budgets. A feature is incomplete until it has mobile fallback behaviour and a measurable degradation strategy.

## Phase 1 — cinematic environment foundation

Implemented in the first transformation PR:

- deterministic time-of-day, seasons, climate and weather snapshots;
- atmosphere director separated from world composition;
- Gerstner-wave ocean with Fresnel, sun reflection and shoreline foam;
- terrain wetness, seasonal tint and snow response;
- weather particles scaled by quality profile;
- procedural keel-shaped longship hull;
- wind-deformed sail and sea-state-driven ship movement;
- environment rules independent from Three.js.

## Phase 2 — simulation architecture

1. Replace scattered React state with a reducer/state-machine package.
2. Introduce versioned `GameState` and save migration functions.
3. Model ship capacity, hull integrity, rigging, sail condition and repair time.
4. Model crew roles, fatigue, health, loyalty, skills and relationships.
5. Convert voyage progress into distance, weather exposure, consumption and navigation uncertainty.
6. Add delayed consequences and persistent regional reputation.
7. Add deterministic replay seeds for debugging and balancing.

## Phase 3 — world and content scale

- region manifests separate geography, settlements, factions, climate and available events;
- authored encounter graphs replace hard-coded milestone arrays;
- procedural encounter selection respects date, region, season and prior decisions;
- settlement scenes receive reusable building, vegetation and prop kits;
- historical points become explorable micro-scenes rather than only information markers;
- asset manifests contain license, source, LOD and memory metadata.

## Phase 4 — combat and navigation

### Maritime

- wind-relative sail handling;
- rowing stamina and crew assignment;
- collision, grounding and hull leaks;
- boarding approach and disengagement;
- visibility, fog and coastal navigation;
- no arcade cannon combat.

### Land

- small-unit formations;
- stamina, morale and injury;
- shields, spears, axes and bows with historically constrained equipment;
- surrender, ransom and retreat as viable outcomes;
- consequences recorded in reputation and narrative state.

## Phase 5 — narrative and dynasty

- chapter graph spanning 750–1021 without pretending one protagonist lives through the entire period;
- generational succession and inherited reputation;
- companions with authored arcs and systemic relationship states;
- multilingual dialogue pipeline with Old Norse reconstruction notes and Russian subtitles;
- professional voice assets replace browser TTS in production builds.

## Quality gates for every future slice

A slice is not complete until it has:

- a playable decision loop;
- historical evidence annotations;
- high/balanced/battery render budgets;
- keyboard, touch and controller interaction contracts;
- deterministic simulation tests;
- save-schema compatibility;
- production build and public deployment verification;
- a visual review on physical desktop and mobile devices.
