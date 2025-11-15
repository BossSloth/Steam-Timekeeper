import { GameSession } from '@components/TimeManager';
import { container } from 'shared';

const CHECK_INTERVAL = 10000;

const runningApps = new Set<string>();
const runningSessions = new Map<string, GameSession>();

function checkRunningApps(): void {
  const apps = SteamUIStore.RunningApps;

  for (const app of apps) {
    if (runningApps.has(app.appid.toString())) {
      // App is currently running
      onAppHeartbeat(app.appid.toString());
      continue;
    } else {
      // App just started
      onAppLaunched(app.appid.toString());
    }
  }

  for (const appId of runningApps) {
    if (!apps.some(app2 => app2.appid.toString() === appId)) {
      // App just quit
      onAppQuit(appId);
    }
  }

  // const friendApps = new Map<string, string>();

  // for (const friend of friendStore.allFriends) {
  //   const appId = friend.persona.m_unGamePlayedAppID;
  //   if (appId !== 0) {
  //     console.log(`%c${friend.display_name} is playing ${appId}`, 'color: green; font-size: 46px');
  //   }
  // }
}

async function onAppLaunched(appId: string): Promise<void> {
  console.debug(`%cApp ${appId} is now running`, 'color: green; font-size: 46px');
  runningApps.add(appId);

  const { sessionDB } = container;

  const session: GameSession = {
    achievementEntries: [],
    accountId: null,
    appId,
    endTime: new Date(),
    markerEntries: [],
    startTime: new Date(),
  };
  session.id = await sessionDB.addSession(session);
  runningSessions.set(appId, session);
}

async function onAppHeartbeat(appId: string): Promise<void> {
  const session = runningSessions.get(appId);
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
