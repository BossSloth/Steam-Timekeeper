/* eslint-disable @typescript-eslint/class-methods-use-this */

import { MOCK_APP_DATA } from '../TimeManager';
import { AppAchievements, AppData, IAppDataStore } from './IAppDataStore';

export class MockAppDataStore implements IAppDataStore {
  getAppData(appId: string): AppData | null {
    return MOCK_APP_DATA[appId];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAppAchievements(_appId: string): Promise<AppAchievements | null> {
    // TODO: implement
    return Promise.resolve({
      achievements: [],
    });
  }
}
