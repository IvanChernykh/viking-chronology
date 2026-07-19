export type ExpeditionId = 'western-shore' | 'river-road' | 'north-atlantic';

export interface ExpeditionResources {
  food: number;
  timber: number;
  sailcloth: number;
}

export interface ExpeditionEffects extends Partial<ExpeditionResources> {
  morale?: number;
  fatigue?: number;
  health?: number;
  discipline?: number;
  loyalty?: number;
  hull?: number;
  rigging?: number;
  sail?: number;
  silver?: number;
  renown?: number;
}

export interface ExpeditionChoice {
  id: string;
  label: string;
  consequence: string;
  effects: ExpeditionEffects;
}

export interface ExpeditionMilestone {
  id: string;
  progress: number;
  year: number;
  title: string;
  body: string;
  sourceNote: string;
  choices: ExpeditionChoice[];
}

export interface ExpeditionChapter {
  id: ExpeditionId;
  routeId: string;
  title: string;
  subtitle: string;
  period: string;
  startYear: number;
  endYear: number;
  estimatedDays: number;
  risk: 'умеренный' | 'высокий' | 'крайний';
  objective: string;
  historicalFrame: string;
  crewSize: number;
  requirements: ExpeditionResources;
  accent: string;
  milestones: ExpeditionMilestone[];
}

export const expeditionChapters: ExpeditionChapter[] = [
  {
    id: 'western-shore',
    routeId: 'western-europe',
    title: 'Западный берег',
    subtitle: 'Северное море и Британские острова',
    period: '793–866',
    startYear: 793,
    endYear: 866,
    estimatedDays: 24,
    risk: 'высокий',
    objective: 'Достичь английского побережья, пережить штормовой переход и закрепить новый торгово-военный маршрут.',
    historicalFrame: 'Глава объединяет несколько документированных процессов IX века и не изображает их как одно плавание одной команды.',
    crewSize: 42,
    requirements: { food: 64, timber: 28, sailcloth: 18 },
    accent: '#c56b4e',
    milestones: [
      {
        id: 'north-sea-weather',
        progress: 0.24,
        year: 793,
        title: 'Северное море меняет ветер',
        body: 'Фронт закрывает горизонт. Можно переждать у берега или рискнуть и сохранить темп перехода.',
        sourceNote: 'Игровая ситуация реконструирует типовой риск морской навигации, а не конкретный эпизод 793 года.',
        choices: [
          {
            id: 'wait',
            label: 'Переждать у берега',
            consequence: 'Сохраняем команду, но расходуем провизию и теряем время.',
            effects: { food: -8, morale: 4, fatigue: -5, health: 2, renown: -1 },
          },
          {
            id: 'cross',
            label: 'Идти через шторм',
            consequence: 'Экономим время, но повреждаем рангоут и истощаем гребцов.',
            effects: { timber: -7, morale: -8, fatigue: 12, hull: -3, rigging: -8, renown: 4 },
          },
        ],
      },
      {
        id: 'foreign-coast',
        progress: 0.58,
        year: 841,
        title: 'Чужой берег',
        body: 'Разведчики замечают удобное устье и следы постоянного поселения. Решение определит характер контакта.',
        sourceNote: 'Контакт, торговля и насилие сосуществовали; интерфейс не сводит эпоху только к рейдам.',
        choices: [
          {
            id: 'trade',
            label: 'Предложить обмен',
            consequence: 'Медленнее, но безопаснее: команда получает пищу и серебро.',
            effects: { food: 10, morale: 5, loyalty: 4, silver: 8, renown: 3 },
          },
          {
            id: 'pressure',
            label: 'Показать силу',
            consequence: 'Получаем материалы ценой долгосрочного напряжения и падения доверия.',
            effects: { timber: 10, morale: -6, discipline: 4, loyalty: -8, renown: -3 },
          },
        ],
      },
    ],
  },
  {
    id: 'river-road',
    routeId: 'eastern-rivers',
    title: 'Речной путь',
    subtitle: 'Балтика, волоки и Восточная Европа',
    period: '860–907',
    startYear: 860,
    endYear: 907,
    estimatedDays: 52,
    risk: 'умеренный',
    objective: 'Пройти от Балтики к речным системам Восточной Европы и сохранить судно на волоках.',
    historicalFrame: 'Маршрут показывает долговременный торговый коридор, а не точную трассу одной экспедиции.',
    crewSize: 34,
    requirements: { food: 58, timber: 38, sailcloth: 12 },
    accent: '#71967f',
    milestones: [
      {
        id: 'portage',
        progress: 0.31,
        year: 862,
        title: 'Волок',
        body: 'Вода заканчивается. Корабль придётся тянуть по влажной земле, разгрузив часть груза.',
        sourceNote: 'Волоки были ключевым элементом речных маршрутов; конкретная процедура зависела от местности и сезона.',
        choices: [
          {
            id: 'reinforce',
            label: 'Усилить полозья',
            consequence: 'Тратим древесину, но защищаем киль и удерживаем дисциплину.',
            effects: { timber: -9, morale: 6, hull: 6, fatigue: 4, discipline: 5 },
          },
          {
            id: 'lighten',
            label: 'Оставить часть груза',
            consequence: 'Снижаем нагрузку на людей, но теряем запасы и доверие к командованию.',
            effects: { food: -12, morale: -3, fatigue: -7, loyalty: -4 },
          },
        ],
      },
      {
        id: 'market',
        progress: 0.68,
        year: 880,
        title: 'Речной рынок',
        body: 'На берегу встречаются серебро, меха, воск и люди из разных языковых миров.',
        sourceNote: 'Сцена объединяет типичные черты международного обмена на восточных маршрутах.',
        choices: [
          {
            id: 'repair',
            label: 'Купить материалы',
            consequence: 'Тратим серебро на корпус, рангоут и новый участок паруса.',
            effects: { timber: 12, sailcloth: 6, food: -6, hull: 8, rigging: 8, sail: 6, silver: -10 },
          },
          {
            id: 'rest',
            label: 'Дать команде отдых',
            consequence: 'Люди восстанавливаются и сильнее доверяют командованию.',
            effects: { food: -9, morale: 12, fatigue: -18, health: 5, loyalty: 4 },
          },
        ],
      },
    ],
  },
  {
    id: 'north-atlantic',
    routeId: 'north-atlantic',
    title: 'Северная Атлантика',
    subtitle: 'Исландия, Гренландия и западный горизонт',
    period: '874–1021',
    startYear: 874,
    endYear: 1021,
    estimatedDays: 84,
    risk: 'крайний',
    objective: 'Пройти цепь североатлантических стоянок и достичь археологически подтверждённого западного горизонта.',
    historicalFrame: 'Глава соединяет многолетние этапы заселения и разведки. Она не утверждает непрерывность одной команды.',
    crewSize: 28,
    requirements: { food: 82, timber: 44, sailcloth: 28 },
    accent: '#d1b36c',
    milestones: [
      {
        id: 'open-ocean',
        progress: 0.29,
        year: 874,
        title: 'Открытый океан',
        body: 'Берег исчезает. Туман скрывает солнце, а течение уводит судно к северу.',
        sourceNote: 'Ситуация иллюстрирует неопределённость открытого морского перехода без современного навигационного оборудования.',
        choices: [
          {
            id: 'birds',
            label: 'Следить за птицами',
            consequence: 'Замедляемся и расходуем пищу, но укрепляем дисциплину и уверенность команды.',
            effects: { food: -10, morale: 7, discipline: 6, fatigue: 4, renown: 2 },
          },
          {
            id: 'current',
            label: 'Держать курс по течению',
            consequence: 'Переход быстрее, но психологически тяжелее и опаснее для такелажа.',
            effects: { morale: -10, sailcloth: -3, fatigue: 11, rigging: -5, renown: 5 },
          },
        ],
      },
      {
        id: 'greenland-winter',
        progress: 0.62,
        year: 985,
        title: 'Зимовка у фьорда',
        body: 'Для следующего перехода нужны ремонт, сушёная пища и решение — рисковать ли ещё одним сезоном.',
        sourceNote: 'Археология подтверждает скандинавские хозяйства в южной Гренландии; конкретная сцена является игровой реконструкцией.',
        choices: [
          {
            id: 'winter',
            label: 'Остаться на зиму',
            consequence: 'Ремонтируем судно и восстанавливаем людей ценой значительного расхода пищи.',
            effects: { timber: 14, sailcloth: 5, food: -18, morale: 8, hull: 12, rigging: 10, sail: 6, fatigue: -18, health: 8 },
          },
          {
            id: 'west',
            label: 'Продолжить на запад',
            consequence: 'Сохраняем сезон и приобретаем славу, но истощаем команду и корпус.',
            effects: { food: -10, morale: -13, fatigue: 16, health: -5, hull: -4, renown: 9 },
          },
        ],
      },
    ],
  },
];

export const defaultResources: ExpeditionResources = { food: 88, timber: 52, sailcloth: 34 };
