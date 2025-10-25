import { OnPopupCreation } from 'onPopupCreation';
import { startCheckRunningApps } from 'runningApps';
import { CGameRecording_TimelineEntryChanged_Notification, gameRecordingRequestHandler } from 'steam-types';
import { ProtobufNotification } from 'steam-types/types/shared/protobuf';
import './components/TimePopup';

export default function PluginMain(): void {
  console.log('Time keeper plugin main');

  const wnd = g_PopupManager.GetExistingPopup('SP Desktop_uid0');
  if (wnd) {
    OnPopupCreation(wnd);
  }
  g_PopupManager.AddPopupCreatedCallback(OnPopupCreation);

  startCheckRunningApps();
  gameRecordingRequestHandler.RegisterForNotifyTimelineEntryChanged((notification: ProtobufNotification<CGameRecording_TimelineEntryChanged_Notification>) => {
    console.log('%cTimeline entry changed', 'color: green; font-size: 46px', notification.Body().toObject());
  });
}
