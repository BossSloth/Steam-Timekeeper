import { TimelineEntryType } from 'steam-types';
import { PlayerAchievement } from 'steam-types/Global/stores/AppDetailsStore';

export interface Achievement {
  description: string;
  icon: string;
  id: string;
  name: string;
  unlocked: boolean;
}

export interface TimelineEntry {
  id: string;
  time: Date;
  type: TimelineEntryType;
}

export interface MarkerTimelineEntry extends TimelineEntry {
  markerDescription: string;
  markerIcon: string;
  markerPriority: number;
  rangeTitle: string;
  type: TimelineEntryType.Event;
}

export interface AchievementTimelineEntry extends TimelineEntry {
  /** the id of the steam achievement */
  achievementId: string;
  type: TimelineEntryType.Achievement;
}

export interface GameSession {
  achievementEntries: AchievementTimelineEntry[];
  appId: string;
  endTime: Date;
  id?: number;
  markerEntries: MarkerTimelineEntry[];
  startTime: Date;
}

export interface AppData {
  /** SteamClient.Apps.GetMyAchievementsForApp() */
  achievements: PlayerAchievement[];
  appId: string;
  icon: string;
  name: string;
}

/**
 * Returns the duration of a game session in minutes.
 * @param {GameSession} session - The game session to calculate the duration for.
 * @returns {number} The duration of the game session in minutes.
 */
export function getDuration(session: GameSession): number {
  const diff = session.endTime.getTime() - session.startTime.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return hours * 60 + minutes;
}

/**
 * Returns the day of the week (in the Day enum) corresponding to the given game session's start time.
 * @param {GameSession} session - The game session to get the day of the week for.
 * @returns {Day} The day of the week of the game session's start time.
 */
export function getDay(session: GameSession): Day {
  const day = session.startTime.getDay();

  return mapDateDay(day);
}

export function mapDateDay(dateDay: number): Day {
  switch (dateDay) {
    case 0:
      return Day.Sun;
    case 1:
      return Day.Mon;
    case 2:
      return Day.Tue;
    case 3:
      return Day.Wed;
    case 4:
      return Day.Thu;
    case 5:
      return Day.Fri;
    case 6:
      return Day.Sat;
    default:
      throw new Error(`Invalid day ${dateDay}`);
  }
}

export enum Day {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun',
}
