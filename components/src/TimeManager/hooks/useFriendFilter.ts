import { useEffect, useState } from 'react';
import { Container } from '../../Container';
import { FriendData } from '../../SteamDataStore/ISteamDataStore';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function useFriendFilter(container: Container) {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [currentUser, setCurrentUser] = useState<FriendData>({} as FriendData);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user and friends on mount
  useEffect(() => {
    async function loadFriends(): Promise<void> {
      const [user, allFriends] = await Promise.all([
        container.steamDataStore.getCurrentUserData(),
        container.steamDataStore.getAllFriends(),
      ]);
      setCurrentUser(user);
      setFriends(allFriends);
      setIsLoading(false);
    }

    loadFriends().catch((error: unknown) => {
      console.error('Failed to load friends:', error);
      setIsLoading(false);
    });
  }, [container.steamDataStore]);

  return {
    friends,
    currentUser,
    isLoading,
  };
}
