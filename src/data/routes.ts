import type { VikingRoute } from '../types';

const nationalMuseumTravel = {
  title: 'National Museum of Denmark — How did the Vikings travel around the world?',
  url: 'https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-viking-age/expeditions-and-raids/how-did-the-vikings-travel-around-in-the-world/',
};

const nationalMuseumEast = {
  title: 'National Museum of Denmark — Dangerous journeys to Eastern Europe and Russia',
  url: 'https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-viking-age/expeditions-and-raids/dangerous-journeys-to-eastern-europe-and-russia/',
};

const unescoMeadows = {
  title: "UNESCO — L’Anse aux Meadows National Historic Site",
  url: 'https://whc.unesco.org/en/list/4/',
};

const englishHeritageLindisfarne = {
  title: 'English Heritage — The Viking raid on Lindisfarne',
  url: 'https://www.english-heritage.org.uk/visit/places/lindisfarne-priory/history/viking-raid/',
};

const silverRoute = {
  title: 'National Museum of Denmark — Silver’s route to Denmark',
  url: 'https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-viking-age/the-silver-hoards-of-the-vikings/silvers-route-to-denmark-trading-with-the-arab-coins/',
};

export const routes: VikingRoute[] = [
  {
    id: 'north-atlantic',
    name: 'Северная Атлантика',
    shortName: 'Атлантика',
    description:
      'Схематическая линия многовекового продвижения из Скандинавии через Британские острова, Исландию и Гренландию к Северной Америке.',
    color: '#d4b36c',
    accent: '#f0dfb4',
    startYear: 750,
    endYear: 1021,
    distanceLabel: '≈ 6 800 км',
    stops: [
      {
        id: 'kaupang',
        name: 'Кёупанг',
        modernCountry: 'Норвегия',
        lat: 59.07,
        lon: 10.1,
        year: 750,
        yearLabel: 'VIII–IX вв.',
        kind: 'homeland',
        headline: 'Торговый узел у Осло-фьорда',
        story:
          'Кёупанг был одним из ранних городских и торговых центров Норвегии. Через подобные порты люди, корабли, серебро и ремесленные товары включались в сеть Северного и Балтийского морей.',
        evidence:
          'Археологические слои показывают интенсивную торговлю и ремесленное производство. Точка обозначает исходную зону, а не старт одной конкретной экспедиции.',
        confidence: 'high',
        sources: [nationalMuseumTravel],
      },
      {
        id: 'lindisfarne',
        name: 'Линдисфарн',
        modernCountry: 'Англия',
        lat: 55.67,
        lon: -1.8,
        year: 793,
        yearLabel: '793',
        kind: 'raid',
        headline: 'Рейд, ставший символической границей эпохи',
        story:
          'Нападение на монастырь Линдисфарна в 793 году потрясло христианский Запад. Оно не было первым скандинавским контактом с Британией, но стало одним из наиболее документированных и запоминающихся ранних рейдов.',
        evidence:
          'Событие фиксируется письменными источниками. Точная дата и состав отряда реконструируются по средневековым хроникам.',
        confidence: 'high',
        sources: [englishHeritageLindisfarne, nationalMuseumTravel],
      },
      {
        id: 'dublin',
        name: 'Дублин',
        modernCountry: 'Ирландия',
        lat: 53.3498,
        lon: -6.2603,
        year: 841,
        yearLabel: 'ок. 841',
        kind: 'settlement',
        headline: 'Зимний лагерь превратился в торговый город',
        story:
          'Скандинавские отряды закрепились у устья Лиффи, создав долговременный укреплённый лагерь. В последующие десятилетия Дублин стал крупным центром торговли, ремесла и морских связей.',
        evidence:
          'Археология города подтверждает плотное поселение и международный обмен. Маршрут показывает историческую связь, а не единый рейс между всеми точками.',
        confidence: 'high',
        sources: [nationalMuseumTravel],
      },
      {
        id: 'reykjavik',
        name: 'Рейкьявик',
        modernCountry: 'Исландия',
        lat: 64.1466,
        lon: -21.9426,
        year: 874,
        yearLabel: 'ок. 870–874',
        kind: 'settlement',
        headline: 'Начало постоянного заселения Исландии',
        story:
          'С конца IX века выходцы из Норвегии и североатлантических островов основали в Исландии устойчивые поселения. Рейкьявик используется как визуальный якорь раннего заселения.',
        evidence:
          'Саги и археология в целом подтверждают позднеIX-вековую хронологию, хотя отдельные даты и персоналии остаются предметом обсуждения.',
        confidence: 'medium',
        sources: [nationalMuseumTravel],
      },
      {
        id: 'brattahlid',
        name: 'Братталид',
        modernCountry: 'Гренландия',
        lat: 61.16,
        lon: -45.52,
        year: 985,
        yearLabel: 'ок. 985–986',
        kind: 'settlement',
        headline: 'Западное поселение Эйрика Рыжего',
        story:
          'Норвежско-исландские переселенцы основали хозяйства в южной Гренландии. Поселения стали базой для дальнейших плаваний на запад и частью североатлантической экономики.',
        evidence:
          'Археология подтверждает скандинавские фермы и церковные комплексы. Даты прибытия основаны также на более поздней саговой традиции.',
        confidence: 'medium',
        sources: [nationalMuseumTravel, unescoMeadows],
      },
      {
        id: 'lanse-aux-meadows',
        name: 'Л’Анс-о-Медоус',
        modernCountry: 'Канада',
        lat: 51.5953,
        lon: -55.5334,
        year: 1021,
        yearLabel: '1021',
        kind: 'archaeology',
        headline: 'Подтверждённое присутствие скандинавов в Северной Америке',
        story:
          'На севере Ньюфаундленда обнаружены остатки деревянно-дерновых построек, кузницы и мастерских скандинавского типа. Современная дендрохронология зафиксировала рубку древесины металлическими инструментами в 1021 году.',
        evidence:
          'Это единственный общепризнанный археологический памятник скандинавского поселения в Северной Америке вне Гренландии.',
        confidence: 'high',
        sources: [unescoMeadows],
      },
    ],
  },
  {
    id: 'western-europe',
    name: 'Западные рейды и поселения',
    shortName: 'Запад',
    description:
      'Схематическое объединение ключевых ударов, зимовок и политических закреплений в Северном море, Франкии и Англии.',
    color: '#a94b35',
    accent: '#e7b39c',
    startYear: 790,
    endYear: 911,
    distanceLabel: '≈ 3 900 км',
    stops: [
      {
        id: 'heby',
        name: 'Хедебю',
        modernCountry: 'Германия',
        lat: 54.49,
        lon: 9.57,
        year: 790,
        yearLabel: 'VIII–XI вв.',
        kind: 'homeland',
        headline: 'Главный транзитный узел между Балтикой и Северным морем',
        story:
          'Хедебю связывал сухопутные и морские пути Ютландии. Через него проходили ремесленные товары, серебро, рабы и импорт из далёких регионов.',
        evidence:
          'Археология показывает развитый порт и многоэтничное торговое население.',
        confidence: 'high',
        sources: [nationalMuseumTravel, silverRoute],
      },
      {
        id: 'dorestad',
        name: 'Дорестад',
        modernCountry: 'Нидерланды',
        lat: 51.97,
        lon: 5.34,
        year: 834,
        yearLabel: '834 и далее',
        kind: 'raid',
        headline: 'Богатая франкская гавань под серией атак',
        story:
          'Дорестад был одним из важнейших торговых центров Каролингской Европы. В IX веке он неоднократно подвергался нападениям и переходил под контроль скандинавских лидеров.',
        evidence:
          'Письменные источники фиксируют повторяющиеся атаки, но состав отрядов и точные траектории плаваний менялись.',
        confidence: 'medium',
        sources: [nationalMuseumTravel],
      },
      {
        id: 'paris',
        name: 'Париж',
        modernCountry: 'Франция',
        lat: 48.8566,
        lon: 2.3522,
        year: 845,
        yearLabel: '845',
        kind: 'raid',
        headline: 'Подъём по Сене и выкуп города',
        story:
          'В 845 году скандинавский флот поднялся по Сене и достиг Парижа. Франкский король выплатил крупный выкуп, что показало стратегическую ценность речных путей и мобильности флота.',
        evidence:
          'Событие хорошо известно по франкским анналам. Численность флота и отдельные детали могут различаться в пересказах.',
        confidence: 'high',
        sources: [nationalMuseumTravel],
      },
      {
        id: 'york',
        name: 'Йорк',
        modernCountry: 'Англия',
        lat: 53.959,
        lon: -1.0815,
        year: 866,
        yearLabel: '866–867',
        kind: 'settlement',
        headline: 'Захват Эофорвика и центр скандинавской власти',
        story:
          'Великая языческая армия заняла Йорк, который стал политическим и торговым центром скандинавского присутствия в северной Англии.',
        evidence:
          'Письменные источники и археологические находки подтверждают глубокую трансформацию городской жизни.',
        confidence: 'high',
        sources: [nationalMuseumTravel],
      },
      {
        id: 'seville',
        name: 'Севилья',
        modernCountry: 'Испания',
        lat: 37.3891,
        lon: -5.9845,
        year: 844,
        yearLabel: '844',
        kind: 'raid',
        headline: 'Дальний рейд в исламскую Иберию',
        story:
          'Скандинавский флот вошёл в Гвадалквивир и атаковал район Севильи. Ответ Кордовского эмирата показал пределы морской внезапности против организованной сухопутной силы.',
        evidence:
          'Событие отражено в арабских хрониках. Маршрут проведён схематично через Атлантику и не претендует на точный дневной трек.',
        confidence: 'high',
        sources: [nationalMuseumTravel],
      },
      {
        id: 'rouen',
        name: 'Руан',
        modernCountry: 'Франция',
        lat: 49.4431,
        lon: 1.0993,
        year: 911,
        yearLabel: '911',
        kind: 'court',
        headline: 'Политическое закрепление в Нормандии',
        story:
          'По соглашению с франкским королём скандинавский лидер Роллон получил земли вокруг нижней Сены в обмен на защиту региона и признание власти. Это стало основой Нормандии.',
        evidence:
          'Общая политическая последовательность хорошо известна, но детали договора реконструируются по более поздним текстам.',
        confidence: 'medium',
        sources: [nationalMuseumTravel],
      },
    ],
  },
  {
    id: 'eastern-rivers',
    name: 'Восточные речные пути',
    shortName: 'Восток',
    description:
      'Балтика, Волхов, Днепр и Волга как связанная сеть торговли, данничества, военной службы и культурного обмена.',
    color: '#6f8d77',
    accent: '#eadfff',
    startYear: 760,
    endYear: 950,
    distanceLabel: '≈ 5 300 км',
    stops: [
      {
        id: 'birka',
        name: 'Бирка',
        modernCountry: 'Швеция',
        lat: 59.335,
        lon: 17.542,
        year: 760,
        yearLabel: 'VIII–X вв.',
        kind: 'homeland',
        headline: 'Балтийская точка сборки восточной торговли',
        story:
          'Бирка на озере Меларен была крупным центром ремесла и обмена. Отсюда купцы и дружины направлялись через Балтику к речным системам Восточной Европы.',
        evidence:
          'Археологические находки показывают связи со славянскими, финно-угорскими, византийскими и исламскими регионами.',
        confidence: 'high',
        sources: [nationalMuseumEast, silverRoute],
      },
      {
        id: 'staraya-ladoga',
        name: 'Старая Ладога',
        modernCountry: 'Россия',
        lat: 60.001,
        lon: 32.297,
        year: 780,
        yearLabel: 'конец VIII в.',
        kind: 'trade',
        headline: 'Вход в систему Волхова и путь к внутренним рекам',
        story:
          'Ладога стала перевалочным пунктом между Балтикой и внутренними водными путями. Здесь можно было переждать погоду, перегрузить товары и подготовиться к более сложным участкам пути.',
        evidence:
          'Национальный музей Дании описывает Ладогу как раннюю точку доступа к землям Руси и место скандинавского присутствия.',
        confidence: 'high',
        sources: [nationalMuseumEast],
      },
      {
        id: 'novgorod',
        name: 'Новгород',
        modernCountry: 'Россия',
        lat: 58.5256,
        lon: 31.2742,
        year: 860,
        yearLabel: 'IX в.',
        kind: 'trade',
        headline: 'Узел между севером, Волгой и Днепром',
        story:
          'Район Новгорода связывал северные торговые центры с бассейнами Волги и Днепра. Движение включало плавание, волоки и зимние поездки по льду.',
        evidence:
          'Точная политическая хронология раннего периода спорна; археология надёжнее подтверждает саму торговую связность региона.',
        confidence: 'medium',
        sources: [nationalMuseumEast],
      },
      {
        id: 'gnezdovo',
        name: 'Гнёздово',
        modernCountry: 'Россия',
        lat: 54.78,
        lon: 31.87,
        year: 900,
        yearLabel: 'IX–X вв.',
        kind: 'trade',
        headline: 'Комплекс у ключевого волока к Днепру',
        story:
          'Гнёздовский комплекс контролировал участок между верховьями рек и был важен для движения людей и товаров к Киеву и Чёрному морю.',
        evidence:
          'Курганы, оружие, украшения и импортные предметы показывают смешанное население и дальние связи.',
        confidence: 'high',
        sources: [nationalMuseumEast],
      },
      {
        id: 'kyiv',
        name: 'Киев',
        modernCountry: 'Украина',
        lat: 50.4501,
        lon: 30.5234,
        year: 882,
        yearLabel: 'конец IX в.',
        kind: 'court',
        headline: 'Политический центр на днепровском коридоре',
        story:
          'Киев стал центральным пунктом власти и перераспределения на пути к Чёрному морю. Скандинавские дружины были частью более широкого и быстро славянизировавшегося общества Руси.',
        evidence:
          'Ранние даты зависят от летописной традиции; материальные данные подтверждают международные связи, но не все детали политического рассказа.',
        confidence: 'medium',
        sources: [nationalMuseumEast],
      },
      {
        id: 'constantinople',
        name: 'Константинополь',
        modernCountry: 'Турция',
        lat: 41.0082,
        lon: 28.9784,
        year: 907,
        yearLabel: 'IX–XI вв.',
        kind: 'court',
        headline: 'Миклагард: рынок, дипломатия и военная служба',
        story:
          'Константинополь был конечной целью днепровского пути, рынком роскошных товаров и центром притяжения для воинов, позднее служивших в Варяжской гвардии.',
        evidence:
          'Торговые и военные контакты надёжно подтверждены, однако отдельные походы и их даты в летописях обсуждаются.',
        confidence: 'high',
        sources: [nationalMuseumEast, nationalMuseumTravel],
      },
      {
        id: 'bolghar',
        name: 'Булгар',
        modernCountry: 'Россия',
        lat: 54.97,
        lon: 49.06,
        year: 922,
        yearLabel: 'X в.',
        kind: 'trade',
        headline: 'Международный рынок на Волге',
        story:
          'Волжский Булгар был важным местом встречи северных торговцев с исламским миром. Через него в Скандинавию поступали огромные объёмы серебряных дирхамов.',
        evidence:
          'Арабские тексты и находки монет подтверждают интенсивный обмен. Линия до Булгара представляет торговый коридор, а не одну экспедицию.',
        confidence: 'high',
        sources: [nationalMuseumEast, silverRoute],
      },
    ],
  },
];

export const allStops = routes.flatMap((route) =>
  route.stops.map((stop) => ({ ...stop, routeId: route.id, routeName: route.name, routeColor: route.color })),
);

export const timelineBounds = {
  min: Math.min(...routes.flatMap((route) => route.stops.map((stop) => stop.year))),
  max: Math.max(...routes.flatMap((route) => route.stops.map((stop) => stop.year))),
};
