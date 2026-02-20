import { Container } from '@components/Container';
import { callable } from '@steambrew/client';
import { SteamDataStore } from 'SteamDataStore';
import { registerLibraryHomePatch } from 'libraryPatchers';
import { OnPopupCreation } from 'onPopupCreation';
import { startCheckRunningApps } from 'runningApps';
import { container, initComponentsPublicDir, initContainer } from 'shared';
import { CGameRecording_TimelineEntryChanged_Notification } from 'steam-types/Protobufs/steam/webuimessages_gamerecording';
import { gameRecordingRequestHandler } from 'steam-types/Runtime/Services';
import { ProtobufNotification } from 'steam-types/types/shared/protobuf';
import './components/TimePopup';

export const GetComponentsPublicDir = callable<[], string>('GetComponentsPublicDir');

export default async function PluginMain(): Promise<void> {
  console.log('Time keeper plugin main');

  const componentsPublicDir = await GetComponentsPublicDir();

  initComponentsPublicDir(componentsPublicDir.replaceAll('\\', '/'));

  initContainer(new Container(
    new SteamDataStore(),
    false,
  ));

  await container.sessionDB.initialize();

  const wnd = g_PopupManager.GetExistingPopup('SP Desktop_uid0');
  if (wnd) {
    OnPopupCreation(wnd);
  }
  g_PopupManager.AddPopupCreatedCallback(OnPopupCreation);

  registerLibraryHomePatch();

  startCheckRunningApps();
  gameRecordingRequestHandler.RegisterForNotifyTimelineEntryChanged((notification: ProtobufNotification<CGameRecording_TimelineEntryChanged_Notification>) => {
    console.log('%cTimeline entry changed', 'color: green; font-size: 46px', notification.Body().toObject());
  });
}
