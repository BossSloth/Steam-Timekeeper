import { PlayerAchievement } from 'steam-types/Global/stores/AppDetailsStore';

export interface ISteamDataStore {
  getAllFriends(): Promise<FriendData[]>;
  getAppAchievements(appId: string): Promise<AppAchievements | null>;
  getAppData(appId: string): Promise<AppData | null>;
  getCurrentUserData(): Promise<FriendData>;
  getFriendData(accountId: string): Promise<FriendData | null>;
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

export interface FriendData {
  accountId: string;
  avatarUrl: string;
  displayName: string;
}
