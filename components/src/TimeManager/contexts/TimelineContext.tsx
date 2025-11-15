import React, { createContext, useContext } from 'react';
import { ISteamDataStore } from '../../SteamDataStore/ISteamDataStore';
import { GameSession } from '../Types';

interface TimelineContextValue {
  setHoveredSessionId(id: number | null): void;
  setSelectedFriendIds(friendIds: string[]): void;
  setSelectedSession(session: GameSession | null): void;
  readonly hoveredSessionId: number | null;
  readonly selectedFriendIds: string[];
  readonly selectedSession: GameSession | null;
  readonly steamDataStore: ISteamDataStore;
  readonly timelineStartHour: number;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

export function useTimelineContext(): TimelineContextValue {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within TimelineProvider');
  }

  return context;
}

interface TimelineProviderProps extends React.PropsWithChildren {
  readonly value: TimelineContextValue;
}

export function TimelineProvider({ children, value }: TimelineProviderProps): React.ReactNode {
  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}
