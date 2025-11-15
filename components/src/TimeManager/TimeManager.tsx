import React, { useMemo, useState } from 'react';
import { Container } from '../Container';
import { Header } from './components/Header';
import { SessionDetailsPanel } from './components/SessionDetailsPanel';
import { Timeline } from './components/Timeline';
import { CURRENT_USER_ID, HOURS_PER_DAY } from './Constants';
import { TimelineProvider } from './contexts/TimelineContext';
import { useFriendFilter } from './hooks';
import { useSessionData } from './hooks/useSessionData';
import { useWeekNavigation } from './hooks/useWeekNavigation';
import { GameSession, Stats } from './Types';
import { getDuration } from './utils/sessionUtils';

export interface TimeManagerProps {
  readonly container: Container;
}

export function TimeManager({ container }: TimeManagerProps): React.ReactNode {
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<number | null>(null);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([CURRENT_USER_ID]);
  const { weekStart, weekEnd, navigateWeek, goToToday } = useWeekNavigation();
  const { sessions, timelineStartHour, isLoading, allWeekSessions } = useSessionData(container, weekStart, weekEnd, selectedFriendIds);
  const { friends, currentUser, isLoading: isLoadingFriends } = useFriendFilter(container);
  const { steamDataStore } = container;

  const visibleHours = useMemo(
    () => Array.from({ length: HOURS_PER_DAY }, (_, i) => (timelineStartHour + i) % HOURS_PER_DAY),
    [timelineStartHour],
  );

  const stats = useMemo((): Stats => {
    const totalMinutes = sessions.reduce((acc, session) => acc + getDuration(session), 0);
    const totalAchievements = sessions.reduce((acc, session) => acc + session.achievementEntries.length, 0);

    return {
      totalPlaytime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      sessionCount: sessions.length,
      achievementCount: totalAchievements,
    };
  }, [sessions]);

  const contextValue = useMemo(
    () => ({
      steamDataStore,
      selectedSession,
      hoveredSessionId,
      selectedFriendIds,
      setSelectedSession,
      setHoveredSessionId,
      setSelectedFriendIds,
      timelineStartHour,
    }),
    [steamDataStore, selectedSession, hoveredSessionId, selectedFriendIds, timelineStartHour],
  );

  if (isLoading || isLoadingFriends) {
    return <div className="time-manager">Loading...</div>;
  }

  return (
    <TimelineProvider value={contextValue}>
      <div className="time-manager theme-dark">
        <Header
          weekStart={weekStart}
          weekEnd={weekEnd}
          stats={stats}
          navigateWeek={navigateWeek}
          goToToday={goToToday}
          friends={friends}
          currentUser={currentUser}
          selectedFriendIds={selectedFriendIds}
          sessions={allWeekSessions}
          onFriendSelectionChange={setSelectedFriendIds}
        />

        <Timeline
          visibleHours={visibleHours}
          weekStart={weekStart}
          sessions={sessions}
        />

        {selectedSession && (
          <SessionDetailsPanel
            session={selectedSession}
            steamDataStore={steamDataStore}
            onClose={() => { setSelectedSession(null); }}
          />
        )}
      </div>
    </TimelineProvider>
  );
}
