/* eslint-disable react/no-multi-comp */
import React from 'react';
import { formatDuration, formatRelativeDate, PlayBarClasses } from 'SteamFunctions';
import { PlayTimeIcon } from './SteamIcons';
import { openTimePopup } from './TimePopup';

export function LastPlayed({ lastPlayedAt }: { readonly lastPlayedAt: Date; }): React.ReactNode {
  return (
    <div className={`${PlayBarClasses.GameStat} ${PlayBarClasses.LastPlayed} Panel`} onDoubleClick={openTimePopup}>
      <div className={PlayBarClasses.GameStatRight}>
        <div className={PlayBarClasses.PlayBarLabel}>
          {LocalizationManager.LocalizeString('#AppDetails_SectionTitle_LastPlayed')}
        </div>
        <div
          className={`${PlayBarClasses.PlayBarDetailLabel} ${PlayBarClasses.LastPlayedInfo}`}
        >
          {formatRelativeDate(lastPlayedAt.getTime() / 1000)}
        </div>
      </div>
    </div>
  );
}

export function Playtime({ totalMinutes }: { readonly totalMinutes: number; }): React.ReactNode {
  return (
    <div className={`${PlayBarClasses.GameStat} ${PlayBarClasses.Playtime} Panel`} onDoubleClick={openTimePopup}>
      <div className={`${PlayBarClasses.GameStatIcon} ${PlayBarClasses.PlaytimeIcon}`}>
        <PlayTimeIcon />
      </div>
      <div className={PlayBarClasses.GameStatRight}>
        <div className={PlayBarClasses.PlayBarLabel}>
          {LocalizationManager.LocalizeString('#AppDetails_SectionTitle_PlayTime')}
        </div>
        <div className={PlayBarClasses.PlayBarDetailLabel}>
          {formatDuration(totalMinutes)}
        </div>
      </div>
    </div>
  );
}
