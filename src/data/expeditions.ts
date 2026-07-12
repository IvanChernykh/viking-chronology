export type ExpeditionId = 'north-atlantic' | 'western-europe' | 'eastern-rivers';

export interface ExpeditionChapter {
  id: ExpeditionId;
  routeId: ExpeditionId;
  title: string;
  subtitle: string;
  departureYear: number;
  arrivalYear: number;
  durationLabel: string;
  risk: 'умеренный' | 'высокий' | 'крайний';
  crew: number;
  objective: string;
  historicalFrame: string;
  requirements: {
    provisions: number;
    timber: number;
    sailcloth: number;
  };
}

export const expeditionChapters: ExpeditionChapter[] = [
  {
    id: 'western-europe', routeId: 'western-europe', title: 'Западный берег', subtitle: 'Скандинавия → Британские острова',
    departureYear: 793, arrivalYear: 866, durationLabel: 'I глава', risk: 'высокий', crew: 34,
    objective: 'Пройти Северное море и открыть западноевропейский исторический коридор.',
    historicalFrame: 'Экспедиция соединяет события разных десятилетий и не изображает одно документированное плавание.',
    requirements: { provisions: 58, timber: 42, sailcloth: 48 },
  },
  {
    id: 'eastern-rivers', routeId: 'eastern-rivers', title: 'Речной путь', subtitle: 'Балтика → речные системы Востока',
    departureYear: 860, arrivalYear: 907, durationLabel: 'II глава', risk: 'умеренный', crew: 28,
    objective: 'Проследить торговые и политические связи через речные системы Восточной Европы.',
    historicalFrame: 'Маршрут представлен как сеть водных и волоковых связей, а не как единая прямая линия.',
    requirements: { provisions: 64, timber: 54, sailcloth: 40 },
  },
  {
    id: 'north-atlantic', routeId: 'north-atlantic', title: 'Северная Атлантика', subtitle: 'Исландия → Гренландия → Винланд',
    departureYear: 874, arrivalYear: 1021, durationLabel: 'III глава', risk: 'крайний', crew: 42,
    objective: 'Раскрыть западную границу скандинавских поселений и археологический горизонт Северной Америки.',
    historicalFrame: 'Глава объединяет последовательные волны освоения на протяжении нескольких поколений.',
    requirements: { provisions: 78, timber: 68, sailcloth: 72 },
  },
];

export interface ExpeditionSupplies { provisions: number; timber: number; sailcloth: number; }
export const initialSupplies: ExpeditionSupplies = { provisions: 44, timber: 38, sailcloth: 36 };
