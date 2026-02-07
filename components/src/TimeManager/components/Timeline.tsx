import React, { useCallback } from 'react';
import { useCurrentTime } from '../hooks';
import { DAYS, GameSession } from '../Types';
import { formatHourLabel, getDateAtEndOfDay, getDateAtMidnight } from '../utils/dateUtils';
import { getSessionDayInfo } from '../utils/sessionUtils';
import { DayRow } from './DayRow';

interface TimelineProps {
  readonly sessions: GameSession[];
  readonly visibleHours: number[];
  readonly weekStart: Date;
}

export function Timeline({
  visibleHours,
  weekStart,
  sessions,
}: TimelineProps): React.ReactNode {
  const currentTime = useCurrentTime();

  const getSessionsForDay = useCallback((dayDate: Date) => {
    const dayStart = getDateAtMidnight(dayDate);
    const dayEnd = getDateAtEndOfDay(dayDate);

    return sessions.filter((session) => {
      const sessionStart = session.startTime;
      const sessionEnd = session.endTime;

      return (
        (sessionStart >= dayStart && sessionStart <= dayEnd)
        || (sessionEnd >= dayStart && sessionEnd <= dayEnd)
        || (sessionStart < dayStart && sessionEnd > dayEnd)
      );
    });
  }, [sessions]);

  const dayHasMidnightSessions = useCallback((dayDate: Date) => {
    const daySessions = getSessionsForDay(dayDate);
    const dayTime = getDateAtMidnight(dayDate);

    return daySessions.some((session) => {
      const { sessionEndDay, spansMidnight } = getSessionDayInfo(session);

      return spansMidnight && dayTime.getTime() === sessionEndDay.getTime();
    });
  }, [getSessionsForDay]);

  return (

    <div className="tm-timeline">
      <div className="tm-time-header">
        <div className="tm-day-label"></div>
        <div className="tm-hours">
          {visibleHours.map(hour => (
            <div key={hour} className="tm-hour-mark">
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>
      </div>

      <div className="tm-days">
        {DAYS.map((day, dayIndex) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + dayIndex);

          return (
            <DayRow
              key={day}
              day={day}
              dayDate={dayDate}
              sessions={getSessionsForDay(dayDate)}
              hasMidnightSessions={dayHasMidnightSessions(dayDate)}
              currentTime={currentTime}
            />
          );
        })}
      </div>
    </div>
  );
}
