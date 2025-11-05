/* eslint-disable @typescript-eslint/class-methods-use-this */
import { AppAchievements, AppData, IAppDataStore } from '@components/AppDataStore/IAppDataStore';

export class AppDataStore implements IAppDataStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAppAchievements(_appId: string): Promise<AppAchievements | null> {
    return Promise.resolve(null);
  }

  getAppData(appId: string): AppData | null {
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
}
