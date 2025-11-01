import React, { useEffect, useMemo, useState } from 'react';
import { PlayerAchievement } from 'steam-types/Global/stores/AppDetailsStore';
import { AppData } from '../AppDataStore/IAppDataStore';
import { Container } from '../Container';
import { Day, getDuration, type GameSession } from './Types';

const DAYS = Object.values(Day);

interface SessionDayInfo {
  sessionEndDay: Date;
  sessionStartDay: Date;
  spansMidnight: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TimeManagerProps {}

// Generate consistent color for a game based on its name
function getGameColor(gameName: string): string {
  // Simple hash function to get consistent hue
  let hash = 0;
  for (let i = 0; i < gameName.length; i++) {
    hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hue (0-360)
  const hue = Math.abs(hash % 360);

  // Use HSL for vibrant, distinguishable colors
  // Higher saturation and moderate lightness for Steam-like appearance
  return `hsl(${hue}, 75%, 55%)`;
}

export function TimeManager({ container }: { readonly container: Container; }): React.ReactNode {
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineStartHour, setTimelineStartHour] = useState(0);

  const { sessionDB, appDataStore } = container;

  // Calculate week end (Sunday)
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);

    return end;
  }, [weekStart]);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize database and load mock data if empty
  useEffect(() => {
    async function initDB(): Promise<void> {
      if (sessionDB.mocked) {
        await sessionDB.initialize();
      }

      // Load optimal start hour from database
      const optimalStartHour = await sessionDB.getOptimalStartHour();
      setTimelineStartHour(optimalStartHour);
      setIsLoading(false);
    }

    initDB();
  }, []);

  // Load sessions for the current week
  useEffect(() => {
    async function loadWeekSessions(): Promise<void> {
      try {
        const start = getDateAtMidnight(weekStart);
        const end = getDateAtEndOfDay(weekEnd);
        const weekSessionsData = await sessionDB.getSessionsByDateRange(start, end);
        setSessions(weekSessionsData);
      } catch (error) {
        console.error('Failed to load week sessions:', error);
      }
    }

    if (!isLoading) {
      loadWeekSessions().catch((err: unknown) => {
        console.error('Failed to load week sessions:', err);
      });
    }
  }, [weekStart, weekEnd, isLoading]);

  // Subscribe to database changes for real-time updates
  useEffect(() => {
    async function handleDatabaseChange(): Promise<void> {
      try {
        // Reload sessions for current week
        const start = getDateAtMidnight(weekStart);
        const end = getDateAtEndOfDay(weekEnd);
        const weekSessionsData = await sessionDB.getSessionsByDateRange(start, end);
        setSessions(weekSessionsData);

        // Reload optimal start hour
        const optimalStartHour = await sessionDB.getOptimalStartHour();
        setTimelineStartHour(optimalStartHour);
      } catch (error) {
        console.error('Failed to reload data after change:', error);
      }
    }

    // Subscribe to changes
    const unsubscribe = sessionDB.addChangeListener(() => {
      handleDatabaseChange().catch((err: unknown) => {
        console.error('Failed to handle database change:', err);
      });
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [weekStart, weekEnd]);

  // Update current time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return (): void => {
      clearInterval(interval);
    };
  }, []);

  const visibleHours = Array.from({ length: 24 }, (_, i) => (timelineStartHour + i) % 24);

  function navigateWeek(offset: number): void {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + offset * 7);
    setWeekStart(newWeek);
  }

  function goToToday(): void {
    setWeekStart(getMonday(new Date()));
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getSessionPosition(session: GameSession, forDay?: Date): { left: string; width: string; } {
    const startHour = session.startTime.getHours() + session.startTime.getMinutes() / 60;
    const duration = getDuration(session) / 60;
    const { sessionStartDay, sessionEndDay, spansMidnight } = getSessionDayInfo(session);

    // Normalize hour to timeline position (accounting for shifted start)
    function normalizeHour(hour: number): number {
      let normalized = hour - timelineStartHour;
      if (normalized < 0) {
        normalized += 24;
      }

      return normalized;
    }

    if (spansMidnight && forDay) {
      const dayTime = getDateAtMidnight(forDay);
      const isStartDay = dayTime.getTime() === sessionStartDay.getTime();
      const isEndDay = dayTime.getTime() === sessionEndDay.getTime();

      if (isStartDay) {
        // Show from start time to midnight
        const normalizedStart = normalizeHour(startHour);
        const hoursUntilMidnight = 24 - startHour;

        return {
          left: `${(normalizedStart / 24) * 100}%`,
          width: `${(hoursUntilMidnight / 24) * 100}%`,
        };
      }
      if (isEndDay) {
        // Show from midnight to end time
        const endHour = session.endTime.getHours() + session.endTime.getMinutes() / 60;
        const normalizedStart = normalizeHour(0);

        return {
          left: `${(normalizedStart / 24) * 100}%`,
          width: `${(endHour / 24) * 100}%`,
        };
      }
    }

    // Normal case: session within same day
    const normalizedStart = normalizeHour(startHour);
    const left = (normalizedStart / 24) * 100;
    const width = (duration / 24) * 100;

    return { left: `${left}%`, width: `${width}%` };
  }

  function getSessionsForDay(dayDate: Date): GameSession[] {
    const dayStart = getDateAtMidnight(dayDate);
    const dayEnd = getDateAtEndOfDay(dayDate);

    return sessions.filter((session) => {
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);

      // Session starts on this day OR session ends on this day (for midnight-spanning sessions)
      return (
        (sessionStart >= dayStart && sessionStart <= dayEnd)
        || (sessionEnd >= dayStart && sessionEnd <= dayEnd)
        || (sessionStart < dayStart && sessionEnd > dayEnd)
      );
    });
  }

  function dayHasMidnightSessions(dayDate: Date): boolean {
    const daySessions = getSessionsForDay(dayDate);
    const dayTime = getDateAtMidnight(dayDate);

    return daySessions.some((session) => {
      const { sessionEndDay, spansMidnight } = getSessionDayInfo(session);
      const isEndDay = spansMidnight && dayTime.getTime() === sessionEndDay.getTime();

      // Only split if there's a session that ENDS on this day (continuation from previous day)
      return isEndDay;
    });
  }

  function getTotalPlaytime(): string {
    const total = sessions.reduce((acc, session) => acc + getDuration(session), 0);

    return formatDuration(total);
  }

  function getTotalAchievements(): number {
    return sessions.reduce((acc, session) => acc + session.achievementEntries.length, 0);
  }

  function getAppData(appId: string): AppData | null {
    return appDataStore.getAppData(appId);
  }

  if (isLoading) {
    return <div className="time-manager">Loading...</div>;
  }

  return (
    <div className="time-manager">
      {/* Header */}
      <div className="tm-header">
        <div className="tm-header-top">
          <h1 className="tm-title">Gaming Activity</h1>
          <div className="tm-date-range">
            <button
              type="button"
              className="tm-nav-btn"
              aria-label="Previous week"
              onClick={() => {
                navigateWeek(-1);
              }}
            >
              &lt;
            </button>
            <span className="tm-date-text">
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </span>
            <button
              type="button"
              className="tm-nav-btn"
              aria-label="Next week"
              onClick={() => {
                navigateWeek(1);
              }}
            >
              &gt;
            </button>
            <button
              type="button"
              className="tm-today-btn"
              onClick={() => {
                goToToday();
              }}
            >
              Today
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="tm-stats">
          <div className="tm-stat-card">
            <div className="tm-stat-value">{getTotalPlaytime()}</div>
            <div className="tm-stat-label">Total Playtime</div>
          </div>
          <div className="tm-stat-card">
            <div className="tm-stat-value">{sessions.length}</div>
            <div className="tm-stat-label">Gaming Sessions</div>
          </div>
          <div className="tm-stat-card">
            <div className="tm-stat-value">{getTotalAchievements()}</div>
            <div className="tm-stat-label">Achievements Unlocked</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        className="tm-timeline"
      >
        {/* Time header */}
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

        {/* Days and sessions */}
        <div className="tm-days">
          {DAYS.map((day) => {
            const dayDate = new Date(weekStart);
            const dayIndex = DAYS.indexOf(day);
            dayDate.setDate(weekStart.getDate() + dayIndex);
            const daySessions = getSessionsForDay(dayDate);

            // Calculate midnight marker position (0:00 on timeline)
            const midnightHour = 0;
            let normalizedMidnight = midnightHour - timelineStartHour;
            if (normalizedMidnight < 0) {
              normalizedMidnight += 24;
            }
            const midnightPosition = (normalizedMidnight / 24) * 100;
            const hasMidnightSessions = dayHasMidnightSessions(dayDate);

            const dayRowHeight = hasMidnightSessions ? '140px' : '70px';

            // Calculate current time position
            const isToday = getDateAtMidnight(currentTime).getTime() === getDateAtMidnight(dayDate).getTime();
            const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
            let normalizedCurrentHour = currentHour - timelineStartHour;
            if (normalizedCurrentHour < 0) {
              normalizedCurrentHour += 24;
            }
            const currentTimePosition = (normalizedCurrentHour / 24) * 100;

            return (
              <div key={day} className="tm-day-row" style={{ height: dayRowHeight }}>
                <div className="tm-day-label">
                  <div className="tm-day-name">{day}</div>
                  <div className="tm-day-date">{dayDate.getDate()}</div>
                </div>
                <div
                  className={`tm-sessions-track ${dayHasMidnightSessions(dayDate) ? 'tm-sessions-track-split' : ''}`}
                  style={{
                    '--midnight-position': `${midnightPosition}%`,
                  } as React.CSSProperties}
                >
                  {isToday && (
                    <div
                      className="tm-current-time-indicator"
                      style={{ left: `${currentTimePosition}%` }}
                    />
                  )}
                  {daySessions.map((session) => {
                    const id = session.id;
                    if (id === undefined) {
                      return null;
                    }
                    const appData = getAppData(session.appId);
                    const position = getSessionPosition(session, dayDate);
                    const { sessionStartDay, sessionEndDay, spansMidnight } = getSessionDayInfo(session);
                    const dayTime = getDateAtMidnight(dayDate);
                    const isStartDay = spansMidnight && dayTime.getTime() === sessionStartDay.getTime();
                    const isEndDay = spansMidnight && dayTime.getTime() === sessionEndDay.getTime();
                    const gameColor = getGameColor(appData?.name ?? session.appId);
                    const isHovered = hoveredSessionId === id;

                    // In split mode: top row for end-day sessions, bottom row for start-day/normal sessions
                    let topPosition: string | undefined;
                    if (hasMidnightSessions) {
                      if (isEndDay) {
                        topPosition = '8px';
                      } else {
                        topPosition = '78px'; // Position in bottom half
                      }
                    }

                    const sessionClasses = ['tm-session'];
                    if (selectedSession?.id === session.id) {
                      sessionClasses.push('tm-session-selected');
                    }
                    if (isStartDay) {
                      sessionClasses.push('tm-session-continues');
                    }
                    if (isEndDay) {
                      sessionClasses.push('tm-session-continued');
                    }
                    if (isHovered) {
                      sessionClasses.push('tm-session-hovered');
                    }
                    // If width is less than 2%, mark it as small
                    if (Number(position.width.slice(0, -1)) < 2) {
                      sessionClasses.push('tm-session-small');
                    }

                    return (
                      <button
                        type="button"
                        key={`${id}-${dayDate.getTime()}`}
                        className={sessionClasses.join(' ')}
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
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session details panel */}
      {selectedSession && (
        <div className="tm-details-panel">
          <div className="tm-details-header">
            <div className="tm-details-game">
              <span className="tm-details-icon">
                <img src={getAppData(selectedSession.appId)?.icon} alt={getAppData(selectedSession.appId)?.name} />
              </span>
              <div>
                <h2 className="tm-details-title">{getAppData(selectedSession.appId)?.name}</h2>
                <p className="tm-details-subtitle">
                  {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)} • {formatDuration(getDuration(selectedSession))}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="tm-close-btn"
              onClick={() => {
                setSelectedSession(null);
              }}
            >
              ✕
            </button>
          </div>

          <div className="tm-details-body">
            {selectedSession.achievementEntries.length > 0
              ? (
                  <>
                    <h3 className="tm-details-section-title">
                      Achievements Unlocked ({selectedSession.achievementEntries.length})
                    </h3>
                    <div className="tm-achievements">
                      {selectedSession.achievementEntries.map((entry) => {
                        // const appData = getAppData(selectedSession.appId);
                        // const achievement = appData?.achievements.find(ach => ach.strID === entry.achievementId);
                        const achievement = {} as PlayerAchievement;

                        return (
                          <div key={entry.id} className="tm-achievement">
                            <span className="tm-achievement-icon">🏆</span>
                            <div className="tm-achievement-info">
                              <div className="tm-achievement-name">{achievement.strName}</div>
                              <div className="tm-achievement-desc">
                                {achievement.strDescription}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )
              : (
                  <div className="tm-no-achievements">
                    <p>No achievements unlocked during this session</p>
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return monday;
}

function getDateAtMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return d;
}

function getDateAtEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);

  return d;
}

function getSessionDayInfo(session: GameSession): SessionDayInfo {
  const sessionStartDay = getDateAtMidnight(session.startTime);
  const sessionEndDay = getDateAtMidnight(session.endTime);
  const spansMidnight = sessionEndDay.getTime() > sessionStartDay.getTime();

  return { sessionStartDay, sessionEndDay, spansMidnight };
}

function formatHourLabel(hour: number): string {
  if (hour === 0) {
    return '12 AM';
  }
  if (hour < 12) {
    return `${hour} AM`;
  }
  if (hour === 12) {
    return '12 PM';
  }

  return `${hour - 12} PM`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
