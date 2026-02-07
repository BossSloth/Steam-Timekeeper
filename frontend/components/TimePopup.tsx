import { TimeManager } from '@components/TimeManager';
import { routerHook } from '@steambrew/client';
import React from 'react';
import { container } from 'shared';
import { EUIMode } from 'steam-types/Global/managers/PopupManager';
import { SteamDialog } from 'SteamComponents';
import { usePopupsStore } from './stores/popupsStore';
import { Styles } from './Styles';

export function TimePopup(): React.ReactNode {
  const { timePopup, setTimePopup } = usePopupsStore();

  if (!timePopup.open) {
    return null;
  }

  return (
    <SteamDialog
      strTitle="Time Popup"
      onDismiss={() => { setTimePopup({ open: false }); }}
      resizable
      saveDimensionsKey="time-popup"
    >
      <Styles />
      <div>
        <TimeManager container={container} />
      </div>
    </SteamDialog>
  );
}

routerHook.addGlobalComponent('TimePopup', () => <TimePopup />, EUIMode.Desktop);
