import { Day, GameSession } from './Types';

export const MOCK_SESSIONS: GameSession[] = [
  {
    id: '1',
    gameName: 'Cyberpunk 2077',
    gameIcon: '🎮',
    startTime: easyDate(Day.Mon, '22:30'),
    endTime: easyDate(Day.Tue, '02:15'),
    achievements: [
      { id: 'a1', name: 'Night City Dreamer', description: 'Complete the prologue', unlocked: true, icon: '🏆' },
      { id: 'a2', name: 'Street Cred', description: 'Reach Street Cred level 10', unlocked: true, icon: '⭐' },
    ],
  },
  {
    id: '2',
    gameName: 'Elden Ring',
    gameIcon: '⚔️',
    startTime: easyDate(Day.Wed, '14:00'),
    endTime: easyDate(Day.Wed, '17:45'),
    achievements: [{ id: 'a3', name: 'Margit the Fell Omen', description: 'Defeated Margit', unlocked: true, icon: '🛡️' }],
  },
  {
    id: '3',
    gameName: 'Counter-Strike 2',
    gameIcon: '🔫',
    startTime: easyDate(Day.Thu, '20:00'),
    endTime: easyDate(Day.Thu, '23:30'),
    achievements: [],
  },
  {
    id: '4',
    gameName: 'Baldur\'s Gate 3',
    gameIcon: '🐉',
    startTime: easyDate(Day.Fri, '16:00'),
    endTime: easyDate(Day.Fri, '20:45'),
    achievements: [
      { id: 'a4', name: 'Mind Flayer', description: 'Discover the truth about the tadpole', unlocked: true, icon: '🧠' },
      { id: 'a5', name: 'Party Time', description: 'Recruit 4 companions', unlocked: true, icon: '👥' },
      { id: 'a6', name: 'Critical Hit', description: 'Land 10 critical hits', unlocked: true, icon: '💥' },
    ],
  },
  {
    id: '5',
    gameName: 'Rocket League',
    gameIcon: '🚗',
    startTime: easyDate(Day.Sat, '15:00'),
    endTime: easyDate(Day.Sat, '17:30'),
    achievements: [{ id: 'a7', name: 'Aerial Expert', description: 'Score an aerial goal', unlocked: true, icon: '✈️' }],
  },
  {
    id: '5-2',
    gameName: 'Rocket League',
    gameIcon: '🚗',
    startTime: easyDate(Day.Sat, '11:00'),
    endTime: easyDate(Day.Sat, '12:30'),
    achievements: [{ id: 'a7', name: 'Aerial Expert', description: 'Score an aerial goal', unlocked: true, icon: '✈️' }],
  },
  {
    id: '6',
    gameName: 'Minecraft',
    gameIcon: '⛏️',
    startTime: easyDate(Day.Fri, '22:15'),
    endTime: easyDate(Day.Sat, '02:42'),
    achievements: [],
  },
  {
    id: '7',
    gameName: 'Minecraft',
    gameIcon: '⛏️',
    startTime: easyDate(Day.Sat, '22:15'),
    endTime: easyDate(Day.Sun, '01:42'),
    achievements: [],
  },
  {
    id: '8',
    gameName: 'Battlefield 6',
    gameIcon: '💣',
    startTime: easyDate(Day.Sun, '14:05'),
    endTime: easyDate(Day.Sun, '18:47'),
    achievements: [],
  },
  {
    id: '9',
    gameName: 'Rocket League',
    gameIcon: '🚗',
    startTime: easyDate(Day.Mon, '15:00', 1),
    endTime: easyDate(Day.Mon, '17:30', 1),
    achievements: [{ id: 'a7', name: 'Aerial Expert', description: 'Score an aerial goal', unlocked: true, icon: '✈️' }],
  },
];

function easyDate(
  day: Day,
  time: string,
  weekOffset = 0,
  baseDate: Date = new Date(),
): Date {
  // Normalize day string
  const days: Record<string, number> = {
    [Day.Mon]: 0,
    [Day.Tue]: 1,
    [Day.Wed]: 2,
    [Day.Thu]: 3,
    [Day.Fri]: 4,
    [Day.Sat]: 5,
    [Day.Sun]: 6,
  };

  const targetDay = days[day];

  const result = new Date(baseDate);
  let currentDay = result.getDay(); // JS gives 0=Sun, 1=Mon...
  currentDay = (currentDay + 6) % 7; // shift so Monday=0, Sunday=6

  // Calculate day difference within the week
  const diff = targetDay - currentDay;

  // Move to target day in this week + offset
  result.setDate(result.getDate() + diff + weekOffset * 7);

  // Parse time string (HH:mm:ss)
  const [hours, minutes, seconds] = time.split(':').map(Number);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  result.setHours(hours, minutes, seconds ?? 0, 0);

  return result;
}
