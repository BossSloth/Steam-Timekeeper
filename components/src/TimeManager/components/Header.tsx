/* eslint-disable react/no-multi-comp */
import React from 'react';
import { FriendData } from '../../SteamDataStore/ISteamDataStore';
import { GameSession, Stats } from '../Types';
import { formatDate } from '../utils/dateUtils';
import { FriendSelector } from './FriendSelector';

interface HeaderProps {
  goToToday(): void;
  navigateWeek(offset: number): void;
  onFriendSelectionChange(selectedIds: string[]): void;
  readonly currentUser: FriendData;
  readonly friends: FriendData[];
  readonly selectedFriendIds: string[];
  readonly sessions: GameSession[];
  readonly stats: Stats;
  readonly weekEnd: Date;
  readonly weekStart: Date;
}

function Header({ weekStart, weekEnd, stats, navigateWeek, goToToday, friends, currentUser, selectedFriendIds, sessions, onFriendSelectionChange }: HeaderProps): React.ReactNode {
  return (
    <div className="tm-header">
      <div className="tm-header-top">
        <h1 className="tm-title">Gaming Activity</h1>
        <div className="tm-header-controls">
          <FriendSelector
            friends={friends}
            currentUser={currentUser}
            selectedFriendIds={selectedFriendIds}
            sessions={sessions}
            onSelectionChange={onFriendSelectionChange}
          />
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
              onClick={goToToday}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="tm-stats">
        <StatCard value={stats.totalPlaytime} label="Total Playtime" />
        <StatCard value={stats.sessionCount} label="Gaming Sessions" />
        <StatCard value={stats.achievementCount} label="Achievements Unlocked" />
      </div>
    </div>
  );
}

interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
}

function StatCard({ value, label }: StatCardProps): React.ReactNode {
  return (
    <div className="tm-stat-card">
      <div className="tm-stat-value">{value}</div>
      <div className="tm-stat-label">{label}</div>
    </div>
  );
}

export { Header, StatCard };
