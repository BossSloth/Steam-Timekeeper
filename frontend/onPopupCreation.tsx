import { usePopupsStore } from 'components/stores/popupsStore';
import { initMainWindow, MAIN_WINDOW_NAME, mainWindow } from 'shared';
import { MainWindowPopup, Popup } from 'steam-types/Global/Managers/PopupManager';

export function OnPopupCreation(popup: Popup | undefined): void {
  if (!popup) return;

  if (isMainWindow(popup)) {
    OnMainWindowCreation(popup);
  }
}

function isMainWindow(popup: Popup): popup is MainWindowPopup {
  return popup.m_strName === MAIN_WINDOW_NAME;
}

function OnMainWindowCreation(popup: MainWindowPopup): void {
  initMainWindow(popup.m_popup);

  mainWindow.addEventListener('keydown', (e) => {
    if (e.key === 'F10') {
      const state = usePopupsStore.getState();
      state.setTimePopup({ open: !state.timePopup.open });
    }
  });
}
