import { PlayerAchievement } from 'steam-types/Global/stores/AppDetailsStore';

export interface IAppDataStore {
  getAppAchievements(appId: string): Promise<AppAchievements | null>;
  getAppData(appId: string): AppData | null;
}

export interface AppData {
  appId: string;
  icon: string;
  name: string;
}

export interface AppAchievements {
  /** SteamClient.Apps.GetMyAchievementsForApp() */
  achievements: PlayerAchievement[];
}
