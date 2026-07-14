# Security and Networking

## Trust boundaries

- Client positions are used only as hints; server character position is authoritative.
- Resource and progression changes are server-only.
- Every RemoteEvent payload is validated for type and bounded string length.
- High-frequency endpoints have per-player rate limits.
- Interactions require a tagged target and server distance check.
- DataStore access exists only in server Scripts.

## Expansion checklist

For every new remote:

1. define the name in `Protocol.luau`;
2. define a validator;
3. document maximum frequency;
4. enforce ownership/permission;
5. enforce spatial constraints when applicable;
6. log abuse without exposing secrets;
7. never accept client-calculated rewards.
