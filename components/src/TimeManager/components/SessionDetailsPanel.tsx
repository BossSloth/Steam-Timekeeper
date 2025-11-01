import React, { useEffect, useState } from 'react';
import { PlayerAchievement } from 'steam-types/Global/stores/AppDetailsStore';
import { IAppDataStore } from '../../AppDataStore/IAppDataStore';
import { GameSession } from '../Types';
import { getDuration } from '../utils';
import { formatDuration, formatTime } from '../utils/dateUtils';

interface SessionDetailsPanelProps {
  onClose(): void;
  readonly appDataStore: IAppDataStore;
  readonly session: GameSession;
}

function SessionDetailsPanel({ session, appDataStore, onClose }: SessionDetailsPanelProps): React.ReactNode {
  const appData = appDataStore.getAppData(session.appId);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);

  useEffect(() => {
    async function loadAchievements(): Promise<void> {
      // TODO: implement better caching
      const appAchievements = await appDataStore.getAppAchievements(session.appId);
      if (appAchievements) {
        setAchievements(appAchievements.achievements);
      }
    }

    loadAchievements().catch((err: unknown) => {
      console.error('Failed to load achievements:', err);
    });
  }, [appDataStore, session.appId]);

  return (
    <div className="tm-details-panel">
      <div className="tm-details-header">
        <div className="tm-details-game">
          <span className="tm-details-icon">
            <img src={appData?.icon} alt={appData?.name} />
          </span>
          <div>
            <h2 className="tm-details-title">{appData?.name}</h2>
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
