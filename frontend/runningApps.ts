import { GameSession } from '@components/TimeManager';
import { container } from 'shared';

const CHECK_INTERVAL = 10000;

const runningApps = new Set<string>();
const runningSessions = new Map<string, GameSession>();

const runningFriendApps = new Map<string, string>();
const runningFriendSessions = new Map<string, GameSession>();

async function checkRunningApps(): Promise<void> {
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

  // Process all friend operations in parallel for better performance
  const friendOperations = Array.from(friendStore.allFriends).map(async (friend) => {
    const currentRunningApp = runningFriendApps.get(friend.accountid.toString());
    const appId = friend.persona.m_unGamePlayedAppID;

    if (!appId || appId === 0) {
      if (currentRunningApp !== undefined) {
        await onFriendAppQuit(friend.accountid.toString());
      }

      return;
    }

    const appIdStr = appId.toString();

    if (currentRunningApp === appIdStr) {
      await onFriendAppHeartbeat(friend.accountid.toString());
    } else {
      if (currentRunningApp !== undefined) {
        await onFriendAppQuit(friend.accountid.toString());
      }
      await onFriendAppLaunched(appIdStr, friend.accountid.toString());
    }
  });

  await Promise.all(friendOperations);
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

async function onFriendAppLaunched(appId: string, accountId: string): Promise<void> {
  console.debug(`%cApp ${appId} is now running for friend ${accountId}`, 'color: green; font-size: 46px');
  runningFriendApps.set(accountId, appId);

  const { sessionDB } = container;

  const session: GameSession = {
    achievementEntries: [],
    accountId,
    appId,
    endTime: new Date(),
    markerEntries: [],
    startTime: new Date(),
  };
  session.id = await sessionDB.addSession(session);
  runningFriendSessions.set(accountId, session);
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

async function onFriendAppHeartbeat(accountId: string): Promise<void> {
  const session = runningFriendSessions.get(accountId);
  if (!session) {
    return;
  }
  console.debug(`%cApp ${session.appId} is now running for friend ${accountId}`, 'color: green; font-size: 46px');

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

async function onFriendAppQuit(accountId: string): Promise<void> {
  const session = runningFriendSessions.get(accountId);
  if (!session) {
    return;
  }
  console.debug(`%cApp ${session.appId} is no longer running for friend ${accountId}`, 'color: red; font-size: 46px');

  const { sessionDB } = container;

  session.endTime = new Date();
  await sessionDB.updateSession(session);

  runningFriendApps.delete(accountId);
  runningFriendSessions.delete(accountId);
}

export function startCheckRunningApps(): void {
  setInterval(() => {
    checkRunningApps();
  }, CHECK_INTERVAL);
}
