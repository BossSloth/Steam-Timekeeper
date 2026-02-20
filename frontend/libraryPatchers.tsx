/* eslint-disable @typescript-eslint/strict-void-return */
import { beforePatch } from '@steambrew/client';
import { LastPlayed, Playtime } from 'components/PlayBar';
import { openTimePopup } from 'components/TimePopup';
import React from 'react';
import { container, mainWindow, NON_STEAM_APP_APPID_MASK, WaitForElement } from 'shared';
import { SteamAppOverview } from 'steam-types/Global/stores/AppStore';
import { formatPlaytime, HomeAppClasses, PlayBarClasses } from 'SteamFunctions';
import { getReactFiberFromNode, renderComponent } from './util';

export async function patchLibraryApp(window: Window, appId: string): Promise<void> {
  const app = appStore.m_mapApps.get(Number(appId));

  if (!app) {
    return;
  }

  if (app.appid < NON_STEAM_APP_APPID_MASK) {
    // This is a Steam app, not a non-steam app - make the existing playtime blocks open the time popup
    const playtimeBlocks = window.document.querySelectorAll(`.${PlayBarClasses.GameStat}`);

    for (const playtimeBlock of playtimeBlocks) {
      playtimeBlock.addEventListener('dblclick', openTimePopup);
    }

    return;
  }

  const appTimes = await container.sessionDB.getAppTimes(appId);

  await WaitForElement(`.${PlayBarClasses.GameStatsSection}`, window.document);

  const playBar = window.document.querySelectorAll(`.${PlayBarClasses.GameStatsSection}`)[1];

  if (!playBar) {
    return;
  }

  const lastPlayedTime = appTimes.lastPlayedTime;

  if (lastPlayedTime !== null) {
    const lastPlayed = renderComponent(<LastPlayed lastPlayedAt={lastPlayedTime} />);

    playBar.appendChild(lastPlayed);
  }

  const totalPlaytime = appTimes.totalMinutes;

  if (totalPlaytime !== 0) {
    const playtime = renderComponent(<Playtime totalMinutes={totalPlaytime} />);

    playBar.appendChild(playtime);
  }
}

export function registerLibraryHomePatch(): () => void {
  const patch = beforePatch(
    collectionStore as Record<string, unknown>,
    'OnAppOverviewChange',
    async ([apps]: [SteamAppOverview[]]) => {
      await patchNonSteamAppTimes(apps);
    },
  );

  return patch.unpatch;
}

export async function patchNonSteamAppTimes(apps: SteamAppOverview[]): Promise<void> {
  const nonSteamApps = apps.filter(app => app.appid >= NON_STEAM_APP_APPID_MASK);

  const appIds = nonSteamApps.map(app => app.appid.toString());

  const appTimes = await container.sessionDB.getMultipleAppTimes(appIds);

  for (const [index, app] of nonSteamApps.entries()) {
    const appTime = appTimes[index];

    if (!appTime) {
      continue;
    }

    app.minutes_playtime_forever = appTime.totalMinutes;
    app.minutes_playtime_last_two_weeks = appTime.lastTwoWeeksMinutes;
    app.rt_last_time_played = (appTime.lastPlayedTime?.getTime() ?? 0) / 1000;
  }
}

export async function patchExistingHomeAppTimeInfo(): Promise<void> {
  await WaitForElement(`.${HomeAppClasses.PlaytimeDetails}`, mainWindow.document);

  const playtimeDetailsParent = mainWindow.document.querySelector(`.${HomeAppClasses.PlaytimeDetails}`);

  if (!playtimeDetailsParent) {
    return;
  }

  const appProp = getReactFiberFromNode(playtimeDetailsParent)?.return?.pendingProps.app as object | undefined;

  if (!appProp || !('appid' in appProp)) {
    return;
  }
  const app = appProp as SteamAppOverview;

  if (app.appid < NON_STEAM_APP_APPID_MASK) {
    return;
  }

  const appTimes = await container.sessionDB.getAppTimes(app.appid.toString());

  const playedTotalElm = playtimeDetailsParent.querySelector(`.${HomeAppClasses.PlayedTotal}`);
  if (playedTotalElm !== null && appTimes.totalMinutes !== 0) {
    playedTotalElm.textContent = formatPlaytime(appTimes.totalMinutes, '#AppBox_TotalPlayTime_');
  }

  const playedRecentElm = playtimeDetailsParent.querySelector(`.${HomeAppClasses.PlayedRecent}`);
  if (playedRecentElm !== null && appTimes.lastTwoWeeksMinutes !== 0) {
    playedRecentElm.textContent = formatPlaytime(appTimes.lastTwoWeeksMinutes, '#AppBox_RecentPlayTime_');
  }
}
