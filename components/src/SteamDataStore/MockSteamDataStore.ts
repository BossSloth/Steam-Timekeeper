/* eslint-disable @typescript-eslint/class-methods-use-this */

import { MOCK_APP_DATA } from '../TimeManager';
import { CURRENT_USER_ID } from '../TimeManager/Constants';
import { AppAchievements, AppData, FriendData, ISteamDataStore } from './ISteamDataStore';

const MOCK_CURRENT_USER: FriendData = {
  accountId: CURRENT_USER_ID,
  avatarUrl: 'https://i.redd.it/ysklz8dfmn6a1.jpg',
  displayName: 'CoolFriend120',
};

const MOCK_FRIENDS: FriendData[] = [
  {
    accountId: '123456789',
    avatarUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    displayName: 'Supersonic Ripple',
  },
  {
    accountId: '987654321',
    avatarUrl: 'https://shared.akamai.steamstatic.com/community_assets/images/items/1263950/ebc5939416c91ebfdcd609339b8326d6fbfb42ca.gif',
    displayName: 'ShatteredSlayer',
  },
];

export class MockSteamDataStore implements ISteamDataStore {
  async getAppData(appId: string): Promise<AppData | null> {
    return Promise.resolve(MOCK_APP_DATA[appId]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAppAchievements(_appId: string): Promise<AppAchievements | null> {
    // TODO: implement
    return Promise.resolve({
      achievements: [],
    });
  }

  async getAllFriends(): Promise<FriendData[]> {
    return Promise.resolve(MOCK_FRIENDS);
  }

  async getCurrentUserData(): Promise<FriendData> {
    return Promise.resolve(MOCK_CURRENT_USER);
  }

  async getFriendData(accountId: string): Promise<FriendData | null> {
    const friend = MOCK_FRIENDS.find(f => f.accountId === accountId);

    return Promise.resolve(friend ?? null);
  }
}
