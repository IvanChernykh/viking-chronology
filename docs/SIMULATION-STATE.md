# Expedition Simulation State

## Purpose

The expedition simulation is a renderer-independent domain layer. React presents the state and dispatches commands; Three.js renders derived snapshots. Neither renderer owns the rules for supplies, ship damage, crew condition or persistent consequences.

## Versioned state

Current schema version: `1`.

```text
ExpeditionSimulationState
├── selectedChapterId
├── stage / progress / elapsedDays
├── resources
│   ├── food
│   ├── timber
│   └── sailcloth
├── ship
│   ├── hull
│   ├── rigging
│   └── sail
├── crew
│   ├── morale
│   ├── fatigue
│   ├── health
│   ├── discipline
│   └── loyalty
├── silver / renown
├── readyCrewIds
├── handledMilestoneIds
├── activeEncounterId
└── consequence ledger
```

The schema uses JSON-compatible primitives and arrays only. It intentionally excludes React state setters, `Set`, Three.js objects, browser handles and wall-clock time.

## Deterministic reducer

`expeditionReducer` is a pure transition function. The same state and action produce the same next state.

External inputs are explicit:

- simulation delta;
- selected chapter definition;
- deterministic environment snapshot;
- selected encounter choice.

This enables future replay, balancing tools, automated scenario testing and migration to another renderer or engine.

## Voyage simulation

During a voyage the model calculates:

- progress from voyage duration, wind, sea state and seaworthiness;
- food consumption from elapsed voyage days and crew size;
- fatigue from voyage duration, sea state and precipitation;
- morale pressure from fatigue and low provisions;
- hull damage from wave energy;
- rigging and sail damage from wind and precipitation;
- health loss from starvation, extreme fatigue and cold.

The UI advances the reducer at a fixed low frequency rather than committing React state on every rendered frame.

## Readiness gates

A voyage cannot begin until:

- chapter supply requirements are met;
- at least two named crew members have joined the council;
- seaworthiness is at least 62;
- crew health is at least 55;
- crew loyalty is at least 35.

## Persistent consequences

Encounter effects can modify:

- supplies;
- hull, rigging and sail;
- morale, fatigue, health, discipline and loyalty;
- silver and renown.

Every decision creates a consequence record containing the event, selected choice, year, summary and numerical effects. The latest 24 records remain in the campaign ledger.

## Save contract

`saveGame.ts` stores the versioned state in `localStorage` and performs defensive normalization during load:

- unknown or malformed values fall back to safe defaults;
- percentages are clamped to `0–100`;
- currencies cannot become negative;
- arrays are filtered by primitive type;
- invalid schema versions start a clean campaign rather than crashing boot.

Persistence failure is non-fatal because private browsing and embedded webviews may restrict storage.

## Engine migration boundary

A Unity or Unreal implementation can reproduce this domain state and reducer without porting React or Three.js. The web renderer should eventually consume a smaller read-only presentation snapshot while authoritative campaign rules remain in a shared simulation package or server.
