import React, { createContext, useContext } from 'react';
import { IAppDataStore } from '../../AppDataStore/IAppDataStore';
import { GameSession } from '../Types';

interface TimelineContextValue {
  setHoveredSessionId(id: number | null): void;
  setSelectedSession(session: GameSession): void;
  readonly appDataStore: IAppDataStore;
  readonly hoveredSessionId: number | null;
  readonly selectedSession: GameSession | null;
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
