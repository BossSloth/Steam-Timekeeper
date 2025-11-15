/* eslint-disable @typescript-eslint/class-methods-use-this */
import { AppAchievements, AppData, FriendData, ISteamDataStore } from '@components/SteamDataStore/ISteamDataStore';
import { CURRENT_USER_ID } from '@components/TimeManager/Constants';
import { AppInfo } from 'steam-types/Global/stores/AppInfoStore';
import { SteamFriend } from 'steam-types/Global/stores/FriendStore/FriendStore';
import { sleep } from 'steam-types/Runtime/helpers';

export class SteamDataStore implements ISteamDataStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAppAchievements(_appId: string): Promise<AppAchievements | null> {
    return Promise.resolve(null);
  }

  async getAllFriends(): Promise<FriendData[]> {
    const friends = friendStore.allFriends;

    // Sort by favorite and then name
    friends.sort((a, b) => {
      if (this.isFavorite(a) !== this.isFavorite(b)) {
        return this.isFavorite(b) ? 1 : -1;
      }

      return a.display_name.localeCompare(b.display_name);
    });

    const mappedFriends = friends.map(friend => this.mapFriend(friend));

    return Promise.resolve(mappedFriends);
  }

  async getCurrentUserData(): Promise<FriendData> {
    const currentUser = friendStore.m_FriendsUIFriendStore.GetPlayer(friendStore.currentUserSteamID.GetAccountID());

    return Promise.resolve(this.mapFriend(currentUser, CURRENT_USER_ID));
  }

  async getFriendData(accountId: string): Promise<FriendData | null> {
    const friend = friendStore.m_FriendsUIFriendStore.GetPlayer(Number(accountId));

    const friendData = this.mapFriend(friend);

    return Promise.resolve(friendData);
  }

  private mapFriend(friend: SteamFriend, accountId?: string): FriendData {
    return {
      accountId: accountId ?? String(friend.accountid),
      avatarUrl: friend.persona.avatar_url_medium,
      displayName: friend.display_name,
    };
  }

  private isFavorite(friend: SteamFriend): boolean {
    return friendStore.favoriteFriends.some(f => f.accountid === friend.accountid);
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
