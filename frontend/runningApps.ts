import { GameSession } from '@components/TimeManager';
import { container } from 'shared';
import { SteamAppOverview } from 'steam-types/Global/stores/SteamUIStore/index';

const CHECK_INTERVAL = 5000;

const runningApps = new Set<string>();
const runningSessions = new Map<string, GameSession>();

function checkRunningApps(): void {
  const apps = SteamUIStore.RunningApps;

  for (const app of apps) {
    if (runningApps.has(app.appid.toString())) {
      // App is currently running
      onAppHeartbeat(app);
      continue;
    } else {
      // App just started
      onAppLaunched(app);
    }
  }

  for (const appId of runningApps) {
    if (!apps.some(app2 => app2.appid.toString() === appId)) {
      // App just quit
      onAppQuit(appId);
    }
  }
}

async function onAppLaunched(appOverview: SteamAppOverview): Promise<void> {
  console.debug(`%cApp ${appOverview.appid.toString()} is now running`, 'color: green; font-size: 46px');
  runningApps.add(appOverview.appid.toString());

  const { sessionDB } = container;

  const session: GameSession = {
    achievementEntries: [],
    appId: appOverview.appid.toString(),
    endTime: new Date(),
    markerEntries: [],
    startTime: new Date(),
  };
  session.id = await sessionDB.addSession(session);
  runningSessions.set(appOverview.appid.toString(), session);
}

async function onAppHeartbeat(appOverview: SteamAppOverview): Promise<void> {
  const session = runningSessions.get(appOverview.appid.toString());
  if (!session) {
    return;
  }

  const { sessionDB } = container;

  session.endTime = new Date();
  await sessionDB.updateSession(session);
}

async function onAppQuit(appId: string): Promise<void> {
  console.debug(`%cApp ${appId} is no longer running`, 'color: red; font-size: 46px');
  const session = runningSessions.get(appId);
  if (!session) {
    return;
  }

  const { sessionDB } = container;

  session.endTime = new Date();
  await sessionDB.updateSession(session);

  runningApps.delete(appId);
  runningSessions.delete(appId);
}

export function startCheckRunningApps(): void {
  setInterval(checkRunningApps, CHECK_INTERVAL);
}
