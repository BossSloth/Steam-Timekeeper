import { SteamAppOverview } from 'steam-types/Global/stores/SteamUIStore/index';

const CHECK_INTERVAL = 5000;

const runningApps = new Set<string>();

function checkRunningApps(): void {
  const apps = SteamUIStore.RunningApps;

  for (const app of apps) {
    if (runningApps.has(app.appid.toString())) {
      // App is currently running
      continue;
    } else {
      // App just started
      onAppLaunched(app);
      runningApps.add(app.appid.toString());
    }
  }

  for (const appid of runningApps) {
    if (!apps.some(app2 => app2.appid.toString() === appid)) {
      // App just quit
      onAppQuit(appid);
      runningApps.delete(appid);
    }
  }
}

function onAppLaunched(appOverview: SteamAppOverview): void {
  console.log(`%cApp ${appOverview.appid.toString()} is now running`, 'color: green; font-size: 46px');
}

function onAppQuit(appid: string): void {
  console.log(`%cApp ${appid} is no longer running`, 'color: red; font-size: 46px');
}

export function startCheckRunningApps(): void {
  setInterval(checkRunningApps, CHECK_INTERVAL);
}
