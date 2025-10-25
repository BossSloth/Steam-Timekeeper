import { TimelineEntryType } from 'steam-types';
import { AppData, Day, GameSession } from './Types';

export const MOCK_SESSIONS: GameSession[] = [
  {
    id: '1',
    appId: '1',
    startTime: easyDate(Day.Mon, '22:30'),
    endTime: easyDate(Day.Tue, '02:15'),
    achievementEntries: [
      { id: 'a1', time: easyDate(Day.Mon, '23:15'), type: TimelineEntryType.Achievement, achievementId: 'ACH_NIGHT_CITY_DREAMER' },
      { id: 'a2', time: easyDate(Day.Tue, '01:30'), type: TimelineEntryType.Achievement, achievementId: 'ACH_STREET_CRED_10' },
    ],
    markerEntries: [],
  },
  {
    id: '2',
    appId: '2',
    startTime: easyDate(Day.Wed, '14:00'),
    endTime: easyDate(Day.Wed, '17:45'),
    achievementEntries: [{ id: 'a3', time: easyDate(Day.Wed, '16:30'), type: TimelineEntryType.Achievement, achievementId: 'ACH_MARGIT_DEFEATED' }],
    markerEntries: [],
  },
  {
    id: '3',
    appId: '3',
    startTime: easyDate(Day.Thu, '20:00'),
    endTime: easyDate(Day.Thu, '23:30'),
    achievementEntries: [],
    markerEntries: [],
  },
  {
    id: '4',
    appId: '4',
    startTime: easyDate(Day.Fri, '16:00'),
    endTime: easyDate(Day.Fri, '20:45'),
    achievementEntries: [
      { id: 'a4', time: easyDate(Day.Fri, '17:15'), type: TimelineEntryType.Achievement, achievementId: 'ACH_MIND_FLAYER' },
      { id: 'a5', time: easyDate(Day.Fri, '18:30'), type: TimelineEntryType.Achievement, achievementId: 'ACH_PARTY_TIME' },
      { id: 'a6', time: easyDate(Day.Fri, '20:00'), type: TimelineEntryType.Achievement, achievementId: 'ACH_CRITICAL_HIT_10' },
    ],
    markerEntries: [],
  },
  {
    id: '5',
    appId: '5',
    startTime: easyDate(Day.Sat, '15:00'),
    endTime: easyDate(Day.Sat, '17:30'),
    achievementEntries: [{ id: 'a7', time: easyDate(Day.Sat, '16:15'), type: TimelineEntryType.Achievement, achievementId: 'ACH_AERIAL_GOAL' }],
    markerEntries: [],
  },
  {
    id: '5-2',
    appId: '5',
    startTime: easyDate(Day.Sat, '11:00'),
    endTime: easyDate(Day.Sat, '12:30'),
    achievementEntries: [{ id: 'a7-2', time: easyDate(Day.Sat, '11:45'), type: TimelineEntryType.Achievement, achievementId: 'ACH_AERIAL_GOAL' }],
    markerEntries: [],
  },
  {
    id: '6',
    appId: '6',
    startTime: easyDate(Day.Fri, '22:15'),
    endTime: easyDate(Day.Sat, '02:42'),
    achievementEntries: [],
    markerEntries: [],
  },
  {
    id: '7',
    appId: '6',
    startTime: easyDate(Day.Sat, '22:15'),
    endTime: easyDate(Day.Sun, '01:42'),
    achievementEntries: [],
    markerEntries: [],
  },
  {
    id: '8',
    appId: '7',
    startTime: easyDate(Day.Sun, '14:05'),
    endTime: easyDate(Day.Sun, '18:47'),
    achievementEntries: [],
    markerEntries: [],
  },
  {
    id: '9',
    appId: '5',
    startTime: easyDate(Day.Mon, '15:00', 1),
    endTime: easyDate(Day.Mon, '17:30', 1),
    achievementEntries: [{ id: 'a7-3', time: easyDate(Day.Mon, '16:00', 1), type: TimelineEntryType.Achievement, achievementId: 'ACH_AERIAL_GOAL' }],
    markerEntries: [],
  },
];

export const MOCK_APP_DATA: Record<string, AppData> = {
  1: {
    name: 'Cyberpunk 2077',
    icon: '🎮',
    achievements: [
      { strID: 'ACH_NIGHT_CITY_DREAMER', strName: 'Night City Dreamer', strDescription: 'Complete the prologue', bAchieved: true, flAchieved: 0, rtUnlocked: 0, bHidden: false, flCurrentProgress: 0, flMaxProgress: 0, flMinProgress: 0, strImage: '' },
      { strID: 'ACH_STREET_CRED_10', strName: 'Street Cred', strDescription: 'Reach Street Cred level 10', bAchieved: true, flAchieved: 0, rtUnlocked: 0, bHidden: false, flCurrentProgress: 0, flMaxProgress: 0, flMinProgress: 0, strImage: '' },
    ],
    appId: '1',
  },
  2: {
    name: 'Elden Ring',
    icon: '⚔️',
    achievements: [{ strID: 'ACH_MARGIT_DEFEATED', strName: 'Margit the Fell Omen', strDescription: 'Defeated Margit the Fell Omen', bAchieved: true, flAchieved: 0, rtUnlocked: 0, bHidden: false, flCurrentProgress: 0, flMaxProgress: 0, flMinProgress: 0, strImage: '' }],
    appId: '2',
  },
  3: {
    name: 'Counter-Strike 2',
    icon: '🔫',
    achievements: [],
    appId: '3',
  },
  4: {
    name: 'Baldur\'s Gate 3',
    icon: '🐉',
    achievements: [
      { strID: 'ACH_MIND_FLAYER', strName: 'Mind Flayer', strDescription: 'Discover the truth about the tadpole', bAchieved: true, flAchieved: 0, rtUnlocked: 0, bHidden: false, flCurrentProgress: 0, flMaxProgress: 0, flMinProgress: 0, strImage: '' },
      { strID: 'ACH_PARTY_TIME', strName: 'Party Time', strDescription: 'Recruit 4 companions', bAchieved: true, flAchieved: 0, rtUnlocked: 0, bHidden: false, flCurrentProgress: 0, flMaxProgress: 0, flMinProgress: 0, strImage: '' },
      { strID: 'ACH_CRITICAL_HIT_10', strName: 'Critical Hit', strDescription: 'Land 10 critical hits', bAchieved: true, flAchieved: 0, rtUnlocked: 0, bHidden: false, flCurrentProgress: 0, flMaxProgress: 0, flMinProgress: 0, strImage: '' },
    ],
    appId: '4',
  },
  5: {
    name: 'Rocket League',
    icon: '🚗',
    achievements: [{ strID: 'ACH_AERIAL_GOAL', strName: 'Aerial Expert', strDescription: 'Score an aerial goal', bAchieved: true, flAchieved: 0, rtUnlocked: 0, bHidden: false, flCurrentProgress: 0, flMaxProgress: 0, flMinProgress: 0, strImage: '' }],
    appId: '5',
  },
  6: {
    name: 'Minecraft',
    icon: '⛏️',
    achievements: [],
    appId: '6',
  },
  7: {
    name: 'Battlefield 6',
    icon: '💣',
    achievements: [],
    appId: '7',
  },
};

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
