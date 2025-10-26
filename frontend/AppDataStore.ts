/* eslint-disable @typescript-eslint/class-methods-use-this */
import { AppAchievements, AppData, IAppDataStore } from '@components/AppDataStore/IAppDataStore';

export class AppDataStore implements IAppDataStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAppAchievements(_appId: string): Promise<AppAchievements | null> {
    return Promise.resolve(null);
  }

  getAppData(appId: string): AppData | null {
    const info = window.appInfoStore.m_mapAppInfo.get(Number(appId));
    if (!info) {
      return {
        appId,
        name: `unknown ${appId}`,
        icon: '',
      };
    }

    return {
      appId,
      name: info.m_strName,
      icon: `/assets/${appId}/${info.m_strIconURL}.jpg`,
    };
  }
}
