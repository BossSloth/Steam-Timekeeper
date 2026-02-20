import React, { useEffect, useState } from 'react';
import { PlayerAchievement } from 'steam-types/Global/stores/AppDetailsStore';
import { AppData, FriendData, ISteamDataStore } from '../../SteamDataStore/ISteamDataStore';
import { GameSession } from '../Types';
import { getDuration } from '../utils';
import { formatDuration, formatTime } from '../utils/dateUtils';
import { UNKNOWN_IMAGE } from '../Constants';

interface SessionDetailsPanelProps {
  onClose(): void;
  readonly session: GameSession;
  readonly steamDataStore: ISteamDataStore;
}

function SessionDetailsPanel({ session, steamDataStore, onClose }: SessionDetailsPanelProps): React.ReactNode {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [friendData, setFriendData] = useState<FriendData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData(): Promise<void> {
      // Load app data
      const data = await steamDataStore.getAppData(session.appId);
      if (!cancelled) {
        setAppData(data);
      }

      // Load achievements
      // TODO: implement better caching
      const appAchievements = await steamDataStore.getAppAchievements(session.appId);
      if (!cancelled && appAchievements) {
        setAchievements(appAchievements.achievements);
      }

      // Load friend data if session has accountId
      if (session.accountId !== null) {
        const friend = await steamDataStore.getFriendData(session.accountId);
        if (!cancelled) {
          setFriendData(friend);
        }
      } else {
        setFriendData(null);
      }
    }

    loadData().catch((err: unknown) => {
      console.error('Failed to load data:', err);
    });

    return (): void => {
      cancelled = true;
    };
  }, [steamDataStore, session.appId, session.accountId]);

  return (
    <div className="tm-details-panel">
      <div className="tm-details-header">
        <div className="tm-details-game">
          <span className="tm-details-icon">
            <img src={appData?.icon ?? UNKNOWN_IMAGE} alt={appData?.name ?? ''} />
          </span>
          <div>
            <div className="tm-details-title-row">
              <h2 className="tm-details-title">{appData?.name ?? `Non-steam app ${session.appId}`}</h2>
              {friendData && (
                <div className="tm-details-friend">
                  <img src={friendData.avatarUrl} alt={friendData.displayName} className="tm-details-friend-avatar" />
                  <span className="tm-details-friend-name">{friendData.displayName}</span>
                </div>
              )}
            </div>
            <p className="tm-details-subtitle">
              {formatTime(session.startTime)} - {formatTime(session.endTime)} • {formatDuration(getDuration(session))}
            </p>
          </div>
        </div>
        <button type="button" className="tm-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="tm-details-body">
        {session.achievementEntries.length > 0
          ? (
              <>
                <h3 className="tm-details-section-title">
                  Achievements Unlocked ({session.achievementEntries.length})
                </h3>
                <div className="tm-achievements">
                  {session.achievementEntries.map((entry) => {
                    const achievement = achievements.find(a => a.strID === entry.achievementId);

                    return (
                      <div key={entry.id} className="tm-achievement">
                        <span className="tm-achievement-icon">🏆</span>
                        <div className="tm-achievement-info">
                          <div className="tm-achievement-name">{achievement?.strName ?? entry.achievementId}</div>
                          <div className="tm-achievement-desc">{achievement?.strDescription ?? 'Achievement unlocked'}</div>
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
  );
}

export { SessionDetailsPanel };
