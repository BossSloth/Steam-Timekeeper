import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '../../Container';
import { CURRENT_USER_ID } from '../Constants';
import { GameSession } from '../Types';
import { getDateAtEndOfDay, getDateAtMidnight } from '../utils/dateUtils';

function useSessionData(
  container: Container,
  weekStart: Date,
  weekEnd: Date,
  selectedFriendIds: string[],
): { isLoading: boolean; sessions: GameSession[]; timelineStartHour: number; allWeekSessions: GameSession[]; } {
  const [allSessions, setAllSessions] = useState<GameSession[]>([]);
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
      setAllSessions(weekSessionsData);
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

  // Filter sessions based on selected friend IDs
  const sessions = useMemo(() => {
    return allSessions.filter((session) => {
      // If accountId is null, it's the user's session - check if 'me' is selected
      if (session.accountId === null) {
        return selectedFriendIds.includes(CURRENT_USER_ID);
      }

      // If friend sessions are selected, show them
      return selectedFriendIds.includes(session.accountId);
    });
  }, [allSessions, selectedFriendIds]);

  return { sessions, timelineStartHour, isLoading, allWeekSessions: allSessions };
}

export { useSessionData };
