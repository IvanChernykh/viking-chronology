export interface DialogueLine {
  oldNorse: string;
  russian: string;
  context: string;
}

export interface VikingCharacter {
  id: string;
  name: string;
  role: string;
  accent: string;
  offset: [number, number, number];
  lines: DialogueLine[];
}

export const vikingCharacters: VikingCharacter[] = [
  {
    id: 'ragnhild-navigator',
    name: 'Рагнхильд',
    role: 'кормчая и проводник',
    accent: '#d4b36c',
    offset: [-0.42, 0, 0.16],
    lines: [
      {
        oldNorse: 'Ver heill. Leiðin liggr vestr um haf.',
        russian: 'Будь здрав. Путь лежит на запад через море.',
        context: 'Нормализованная реконструкция, не цитата из источника.',
      },
      {
        oldNorse: 'Vér siglum með byr ok fylgjum stjǫrnum.',
        russian: 'Мы идём при попутном ветре и держим путь по звёздам.',
        context: 'Реплика описывает общую навигационную практику без утверждения о конкретном плавании.',
      },
    ],
  },
  {
    id: 'ketill-shipwright',
    name: 'Кетиль',
    role: 'корабельный мастер',
    accent: '#a94b35',
    offset: [0.08, 0, 0.34],
    lines: [
      {
        oldNorse: 'Skipit er búit. Bord ok saumr halda vel.',
        russian: 'Корабль готов. Доски и заклёпки держат хорошо.',
        context: 'Составная учебная реплика на нормализованном древнескандинавском.',
      },
      {
        oldNorse: 'Sjávarskip þarf léttan skrokk ok sterkan kjǫl.',
        russian: 'Морскому судну нужны лёгкий корпус и крепкий киль.',
        context: 'Исторически ориентированная реконструкция технической речи.',
      },
    ],
  },
  {
    id: 'asa-skald',
    name: 'Аса',
    role: 'скальд и хранительница памяти',
    accent: '#6f8d77',
    offset: [0.48, 0, -0.02],
    lines: [
      {
        oldNorse: 'Minni geymir verk manna.',
        russian: 'Память хранит дела людей.',
        context: 'Авторская реконструкция в нормализованной орфографии.',
      },
      {
        oldNorse: 'Segðu satt, því saga lifir lengi.',
        russian: 'Говори правду, потому что история живёт долго.',
        context: 'Не является строкой из саги; используется как принцип исторической дисциплины проекта.',
      },
    ],
  },
];
