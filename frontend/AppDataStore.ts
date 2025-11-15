/* eslint-disable @typescript-eslint/class-methods-use-this */
import { AppAchievements, AppData, IAppDataStore } from '@components/AppDataStore/IAppDataStore';
import { AppInfo } from 'steam-types/Global/stores/AppInfoStore';
import { sleep } from 'steam-types/Runtime/helpers';

export class AppDataStore implements IAppDataStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAppAchievements(_appId: string): Promise<AppAchievements | null> {
    return Promise.resolve(null);
  }

  async getAppData(appId: string): Promise<AppData | null> {
    if (appStore.m_mapApps.has(Number(appId))) {
      return this.getLocalAppData(appId);
    }

    return this.getRemoteAppData(appId);
  }

  getLocalAppData(appId: string): AppData | null {
    const app = appStore.m_mapApps.get(Number(appId));
    if (!app) {
      return {
        appId,
        name: `unknown ${appId}`,
        icon: '',
      };
    }

    let iconUrl;
    const iconHash = app.icon_hash;
    if (iconHash !== undefined) {
      iconUrl = `/assets/${appId}/${iconHash}.jpg`;
    } else {
      iconUrl = appStore.GetIconURLForApp(app) ?? '';
    }

    return {
      appId,
      name: app.display_name,
      icon: iconUrl,
    };
  }

  async getRemoteAppData(appId: string): Promise<AppData | null> {
    let appInfo: AppInfo = appInfoStore.GetAppInfo(Number(appId));
    while (!appInfo.is_initialized) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(100);

      appInfo = appInfoStore.GetAppInfo(Number(appId));
    }

    return {
      appId,
      name: appInfo.name ?? `unknown ${appId}`,
      icon: appInfo.icon_url,
    };
  }
}
