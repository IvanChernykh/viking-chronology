import { MessageCircle, RotateCcw, Volume2, X } from 'lucide-react';
import type { VikingCharacter } from '../data/dialogues';

interface DialoguePanelProps {
  character: VikingCharacter;
  lineIndex: number;
  speechSupported: boolean;
  onSpeak: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function DialoguePanel({ character, lineIndex, speechSupported, onSpeak, onNext, onClose }: DialoguePanelProps) {
  const line = character.lines[lineIndex % character.lines.length];
  return (
    <aside className="dialogue-panel glass-panel" aria-live="polite" aria-label={`Разговор с ${character.name}`}>
      <div className="dialogue-panel__topline">
        <span className="dialogue-panel__icon"><MessageCircle size={16} /></span>
        <div>
          <span className="eyebrow">Живая хроника</span>
          <strong>{character.name}</strong>
          <small>{character.role}</small>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть разговор"><X size={17} /></button>
      </div>
      <blockquote lang="non">
        “{line.oldNorse}”
      </blockquote>
      <p className="dialogue-panel__subtitle">{line.russian}</p>
      <p className="dialogue-panel__context">{line.context}</p>
      <div className="dialogue-panel__actions">
        <button type="button" onClick={onSpeak} disabled={!speechSupported}>
          <Volume2 size={16} />
          <span>{speechSupported ? 'Повторить озвучку' : 'TTS недоступен'}</span>
        </button>
        <button type="button" onClick={onNext}>
          <RotateCcw size={16} />
          <span>Следующая реплика</span>
        </button>
      </div>
      <small className="dialogue-panel__notice">
        Произношение синтезируется ближайшим доступным северогерманским голосом и является приближением, а не записью речи IX века.
      </small>
    </aside>
  );
}
