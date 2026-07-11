import type { VikingStop } from '../types';

export const kindMeta: Record<
  VikingStop['kind'],
  { label: string; symbol: string; description: string }
> = {
  homeland: { label: 'Исходный узел', symbol: 'ᚠ', description: 'Порт или торговый центр Скандинавии' },
  raid: { label: 'Рейд', symbol: '⚔', description: 'Военное нападение или демонстрация силы' },
  trade: { label: 'Торговля', symbol: '◈', description: 'Рынок, перевалочный пункт или речной коридор' },
  settlement: { label: 'Поселение', symbol: '⌂', description: 'Долговременное присутствие и хозяйственная база' },
  court: { label: 'Центр власти', symbol: '♜', description: 'Политический или военный центр' },
  archaeology: { label: 'Археология', symbol: '◎', description: 'Памятник с прямым материальным подтверждением' },
};
