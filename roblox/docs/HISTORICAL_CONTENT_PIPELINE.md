# Historical Content Pipeline

Every fact, object, dialogue and mission has a content record.

## Evidence levels

1. **Documented** — directly supported by archaeological, textual or institutional evidence.
2. **Probable reconstruction** — supported by multiple compatible sources but not directly documented for the exact scene.
3. **Gameplay connective tissue** — invented interaction required for play; never presented as fact.

## Required record

```yaml
id: FACT_ID
period: 793
region: BRITAIN
claim_ru: "..."
evidence_level: documented
sources:
  - institution: "..."
    title: "..."
    url: "..."
reviewed_by: []
notes: "..."
```

## Dialogue

- Old Norse text requires linguistic review.
- Russian subtitles include natural translation and optional literal gloss.
- Reconstructed wording is labelled in the journal.
- Browser or synthetic speech is not described as authentic pronunciation.
- Voice assets require performer consent and license records.

## Review gate

Historical content cannot move from `draft` to `approved` until a source review and gameplay-context review are recorded.
