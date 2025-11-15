/* eslint-disable react/no-multi-comp */
import React, { useCallback, useEffect, useState } from 'react';
import { AppData } from '../../AppDataStore/IAppDataStore';
import { HOURS_PER_DAY, MINIMUM_SESSION_DURATION } from '../Constants';
import { useTimelineContext } from '../contexts/TimelineContext';
import { Day, GameSession } from '../Types';
import { SessionPosition, formatDuration, generateGameColor, getDateAtMidnight, getDuration, getSessionDayInfo } from '../utils';

interface DayRowProps {
  readonly currentTime: Date;
  readonly day: Day;
  readonly dayDate: Date;
  readonly hasMidnightSessions: boolean;
  readonly sessions: GameSession[];
}

export function DayRow({
  day,
  dayDate,
  sessions,
  currentTime,
  hasMidnightSessions,
}: DayRowProps): React.ReactNode {
  const { timelineStartHour } = useTimelineContext();

  const normalizeHour = useCallback((hour: number) => {
    let normalized = hour - timelineStartHour;
    if (normalized < 0) normalized += HOURS_PER_DAY;

    return normalized;
  }, [timelineStartHour]);

  const getSessionPosition = useCallback((session: GameSession, forDay?: Date): SessionPosition => {
    const startHour = session.startTime.getHours() + session.startTime.getMinutes() / 60;
    const duration = getDuration(session) / 60;
    const { sessionStartDay, sessionEndDay, spansMidnight } = getSessionDayInfo(session);

    if (spansMidnight && forDay) {
      const dayTime = getDateAtMidnight(forDay);
      const isStartDay = dayTime.getTime() === sessionStartDay.getTime();
      const isEndDay = dayTime.getTime() === sessionEndDay.getTime();

      if (isStartDay) {
        const normalizedStart = normalizeHour(startHour);
        const hoursUntilMidnight = HOURS_PER_DAY - startHour;

        return {
          left: `${(normalizedStart / HOURS_PER_DAY) * 100}%`,
          width: `${(hoursUntilMidnight / HOURS_PER_DAY) * 100}%`,
        };
      }
      if (isEndDay) {
        const endHour = session.endTime.getHours() + session.endTime.getMinutes() / 60;
        const normalizedStart = normalizeHour(0);

        return {
          left: `${(normalizedStart / HOURS_PER_DAY) * 100}%`,
          width: `${(endHour / HOURS_PER_DAY) * 100}%`,
        };
      }
    }

    const normalizedStart = normalizeHour(startHour);
    const left = (normalizedStart / HOURS_PER_DAY) * 100;
    const width = (duration / HOURS_PER_DAY) * 100;

    return { left: `${left}%`, width: `${width}%` };
  }, [normalizeHour]);

  const midnightPosition = React.useMemo(() => {
    const normalizedMidnight = normalizeHour(0);

    return (normalizedMidnight / HOURS_PER_DAY) * 100;
  }, [normalizeHour]);

  const isToday = getDateAtMidnight(currentTime).getTime() === getDateAtMidnight(dayDate).getTime();

  const currentTimePosition = React.useMemo(() => {
    if (!isToday) return 0;

    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const normalizedCurrentHour = normalizeHour(currentHour);

    return (normalizedCurrentHour / HOURS_PER_DAY) * 100;
  }, [isToday, currentTime, normalizeHour]);

  const dayRowHeight = hasMidnightSessions ? '140px' : '70px';

  return (
    <div className="tm-day-row" style={{ height: dayRowHeight }}>
      <div className="tm-day-label">
        <div className="tm-day-name">{day}</div>
        <div className="tm-day-date">{dayDate.getDate()}</div>
      </div>
      <div
        className={`tm-sessions-track ${hasMidnightSessions ? 'tm-sessions-track-split' : ''}`}
        style={{ '--midnight-position': `${midnightPosition}%` } as React.CSSProperties}
      >
        {isToday && (
          <div
            className="tm-current-time-indicator"
            style={{ left: `${currentTimePosition}%` }}
          />
        )}
        {sessions.map((session) => {
          const position = getSessionPosition(session, dayDate);

          return (
            <SessionBlock
              key={`${session.id}-${dayDate.getTime()}`}
              session={session}
              dayDate={dayDate}
              hasMidnightSessions={hasMidnightSessions}
              position={position}
            />
          );
        })}
      </div>
    </div>
  );
}

interface SessionBlockProps {
  readonly dayDate: Date;
  readonly hasMidnightSessions: boolean;
  readonly position: SessionPosition;
  readonly session: GameSession;
}

export function SessionBlock({
  session,
  dayDate,
  hasMidnightSessions,
  position,
}: SessionBlockProps): React.ReactNode {
  const { appDataStore, selectedSession, hoveredSessionId, setSelectedSession, setHoveredSessionId } = useTimelineContext();
  const { id } = session;
  const [appData, setAppData] = useState<AppData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAppData(): Promise<void> {
      const data = await appDataStore.getAppData(session.appId);
      if (!cancelled) {
        setAppData(data);
      }
    }

    loadAppData().catch((err: unknown) => {
      console.error('Failed to load app data:', err);
    });

    return (): void => {
      cancelled = true;
    };
  }, [appDataStore, session.appId]);

  if (id === undefined || getDuration(session) < MINIMUM_SESSION_DURATION) {
    return null;
  }
  const { sessionStartDay, sessionEndDay, spansMidnight } = getSessionDayInfo(session);
  const dayTime = getDateAtMidnight(dayDate);
  const isStartDay = spansMidnight && dayTime.getTime() === sessionStartDay.getTime();
  const isEndDay = spansMidnight && dayTime.getTime() === sessionEndDay.getTime();
  const gameColor = generateGameColor(appData?.name ?? session.appId);
  const isHovered = hoveredSessionId === id;
  const isSelected = selectedSession?.id === session.id;

  const topPosition = React.useMemo(() => {
    if (!hasMidnightSessions) return undefined;

    return isEndDay ? '8px' : '78px';
  }, [hasMidnightSessions, isEndDay]);

  const sessionClasses = React.useMemo(() => {
    const classes = ['tm-session'];
    if (isSelected) classes.push('tm-session-selected');
    if (isStartDay) classes.push('tm-session-continues');
    if (isEndDay) classes.push('tm-session-continued');
    if (isHovered) classes.push('tm-session-hovered');

    const width = Number(position.width.slice(0, -1));
    if (width < 2) classes.push('tm-session-small');
    if (width < 1) classes.push('tm-session-tiny');

    return classes.join(' ');
  }, [isSelected, isStartDay, isEndDay, isHovered, position.width]);

  return (
    <button
      type="button"
      className={sessionClasses}
      style={{
        ...position,
        '--game-color': gameColor,
        top: topPosition,
      } as React.CSSProperties}
      onClick={() => {
        setSelectedSession(session);
      }}
      onMouseEnter={() => {
        setHoveredSessionId(id);
      }}
      onMouseLeave={() => {
        setHoveredSessionId(null);
      }}
    >
      <div className="tm-session-content">
        <span className="tm-session-icon">
          <img src={appData?.icon} alt={appData?.name} />
        </span>
        <div className="tm-session-info">
          <div className="tm-session-name">{appData?.name}</div>
          <div className="tm-session-time">{formatDuration(getDuration(session))}</div>
        </div>
      </div>
    </button>
  );
}
