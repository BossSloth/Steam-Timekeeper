import { GameSession } from '../Types';
import { getDateAtMidnight } from './dateUtils';

export interface SessionDayInfo {
  sessionEndDay: Date;
  sessionStartDay: Date;
  spansMidnight: boolean;
}

export interface SessionPosition {
  left: string;
  width: string;
}

/**
 * Returns the duration of a game session in minutes.
 * @param {GameSession} session - The game session to calculate the duration for.
 * @returns {number} The duration of the game session in minutes.
 */
export function getDuration(session: GameSession): number {
  const diffMs = session.endTime.getTime() - session.startTime.getTime();

  return Math.floor(diffMs / (1000 * 60));
}

export function getSessionDayInfo(session: GameSession): SessionDayInfo {
  const sessionStartDay = getDateAtMidnight(session.startTime);
  const sessionEndDay = getDateAtMidnight(session.endTime);
  const spansMidnight = sessionEndDay.getTime() > sessionStartDay.getTime();

  return { sessionStartDay, sessionEndDay, spansMidnight };
}

export function generateGameColor(gameName: string): string {
  let hash = 0;
  for (let i = 0; i < gameName.length; i++) {
    hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);

  return `hsl(${hue}, 75%, 55%)`;
}
