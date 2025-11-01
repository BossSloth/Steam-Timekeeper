import { useCallback, useEffect, useState } from 'react';
import { Container } from '../../Container';
import { GameSession } from '../Types';
import { getDateAtEndOfDay, getDateAtMidnight } from '../utils/dateUtils';

function useSessionData(
  container: Container,
  weekStart: Date,
  weekEnd: Date,
): { isLoading: boolean; sessions: GameSession[]; timelineStartHour: number; } {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [timelineStartHour, setTimelineStartHour] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { sessionDB } = container;

  const loadSessionData = useCallback(async (): Promise<void> => {
    try {
      const start = getDateAtMidnight(weekStart);
      const end = getDateAtEndOfDay(weekEnd);
      const [weekSessionsData, optimalStartHour] = await Promise.all([
        sessionDB.getSessionsByDateRange(start, end),
        sessionDB.getOptimalStartHour(),
      ]);
      setSessions(weekSessionsData);
      setTimelineStartHour(optimalStartHour);
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  }, [sessionDB, weekStart, weekEnd]);

  useEffect(() => {
    async function initDB(): Promise<void> {
      await loadSessionData();
      setIsLoading(false);
    }
    initDB().catch((err: unknown) => {
      console.error('Failed to initialize:', err);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadSessionData();
    }
  }, [weekStart, weekEnd, isLoading]);

  useEffect(() => {
    const unsubscribe = sessionDB.addChangeListener(async () =>
      loadSessionData().catch((err: unknown) => {
        console.error('Failed to handle database change:', err);
      }));

    return unsubscribe;
  }, [sessionDB, loadSessionData]);

  return { sessions, timelineStartHour, isLoading };
}

export { useSessionData };
