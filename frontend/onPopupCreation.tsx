import { openTimePopup } from 'components/TimePopup';
import { patchExistingHomeAppTimeInfo, patchLibraryApp, patchNonSteamAppTimes } from 'libraryPatchers';
import { DESKTOP_MAIN_WINDOW_NAME, GAMEPAD_MAIN_WINDOW_NAME, initMainWindow, mainWindow } from 'shared';
import { MainWindowPopup, Popup } from 'steam-types/Global/managers/PopupManager';
import { appIdPageRegex, homePageRegex, setupLibraryRouteListener } from './SteamRouter';

export function OnPopupCreation(popup: Popup | undefined): void {
  if (!popup) return;

  if (isMainWindow(popup)) {
    OnMainWindowCreation(popup);
  }
}

function isMainWindow(popup: Popup): popup is MainWindowPopup {
  return popup.m_strName === DESKTOP_MAIN_WINDOW_NAME || popup.m_strName === GAMEPAD_MAIN_WINDOW_NAME;
}

function OnMainWindowCreation(popup: MainWindowPopup): void {
  initMainWindow(popup.m_popup);

  mainWindow.addEventListener('keydown', (e) => {
    if (e.key === 'F10') {
      openTimePopup(); // TODO: Remove debug keybind
    }
  });

  setupLibraryRouteListener(appIdPageRegex, (matches) => {
    const appId = matches[1];
    if (appId === undefined || appId === '') {
      return;
    }

    console.log('App page', appId);
    // We wait here for 1ms to let the steam router actually navigate and load the app page
    setTimeout(() => {
      patchLibraryApp(popup.window, appId);
    }, 1);
  });

  setupLibraryRouteListener(homePageRegex, () => {
    patchNonSteamAppTimes(appStore.allApps);
  });

  patchExistingHomeAppTimeInfo();
}
