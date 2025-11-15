import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FriendData } from '../../SteamDataStore/ISteamDataStore';
import { CURRENT_USER_ID } from '../Constants';
import { GameSession } from '../Types';

interface FriendSelectorProps {
  onSelectionChange(selectedIds: string[]): void;
  readonly currentUser: FriendData;
  readonly friends: FriendData[];
  readonly selectedFriendIds: string[];
  readonly sessions: GameSession[];
}

export function FriendSelector({ friends, currentUser, selectedFriendIds, sessions, onSelectionChange }: FriendSelectorProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate session counts for each friend
  const sessionCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Count sessions for each friend
    sessions.forEach((session) => {
      const accountId = session.accountId ?? CURRENT_USER_ID;
      counts[accountId] = (counts[accountId] ?? 0) + 1;
    });

    return counts;
  }, [sessions]);

  const combinedFriends = useMemo(() => {
    return [currentUser, ...friends].sort((a, b) => {
      // Session count
      const aCount = sessionCounts[a.accountId] ?? 0;
      const bCount = sessionCounts[b.accountId] ?? 0;

      if (aCount !== bCount) {
        return bCount - aCount;
      }

      // Display name
      return a.displayName.localeCompare(b.displayName);
    });
  }, [currentUser, friends, sessionCounts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  function toggleFriend(accountId: string): void {
    if (selectedFriendIds.includes(accountId)) {
      onSelectionChange(selectedFriendIds.filter(id => id !== accountId));
    } else {
      onSelectionChange([...selectedFriendIds, accountId]);
    }
  }

  function selectAll(): void {
    onSelectionChange([CURRENT_USER_ID, ...friends.map(f => f.accountId)]);
  }

  function selectOnlyMe(): void {
    onSelectionChange([CURRENT_USER_ID]);
  }

  const filteredFriends = combinedFriends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()));

  const isCurrentUserSelected = selectedFriendIds.includes(CURRENT_USER_ID);
  const totalSelected = selectedFriendIds.length;

  function getDisplayText(): string {
    const totalPossible = friends.length + 1;
    if (totalSelected === 0) {
      return 'No Sessions';
    } else if (totalSelected === 1 && isCurrentUserSelected) {
      return 'My Sessions Only';
    } else if (totalSelected === totalPossible) {
      return 'Everyone';
    }

    return `${totalSelected} Selected`;
  }

  return (
    <div className="tm-friend-selector" ref={dropdownRef}>
      <button
        type="button"
        className="tm-friend-selector-btn"
        onClick={() => { setIsOpen(!isOpen); }}
      >
        {getDisplayText()}
        <span className="tm-dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="tm-friend-dropdown">
          <div className="tm-friend-dropdown-header">
            <span className="tm-friend-dropdown-title">Show Sessions From:</span>
            <div className="tm-friend-dropdown-actions">
              <button
                type="button"
                className="tm-friend-action-btn"
                onClick={selectAll}
              >
                Everyone
              </button>
              <button
                type="button"
                className="tm-friend-action-btn"
                onClick={selectOnlyMe}
              >
                Only Me
              </button>
            </div>
          </div>

          <div className="tm-friend-search">
            <input
              ref={searchInputRef}
              type="text"
              className="tm-friend-search-input"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); }}
            />
          </div>

          <div className="tm-friend-list">
            {filteredFriends.length === 0 && searchQuery && (
              <div className="tm-no-results">
                No friends found matching &quot;{searchQuery}&quot;
              </div>
            )}
            {filteredFriends.map(friend => (
              <>
                <div
                  key={friend.accountId}
                  className={`tm-friend-item ${selectedFriendIds.includes(friend.accountId) ? 'selected' : ''}`}
                  onClick={() => { toggleFriend(friend.accountId); }}
                >
                  <input
                    type="checkbox"
                    checked={selectedFriendIds.includes(friend.accountId)}
                    onChange={() => { toggleFriend(friend.accountId); }}
                    onClick={(e) => { e.stopPropagation(); }}
                  />
                  <img
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    className="tm-friend-avatar"
                  />
                  <span className="tm-friend-name">{friend.displayName}</span>
                  <span className="tm-friend-session-count">
                    {sessionCounts[friend.accountId] || 0}
                  </span>
                </div>
                {friend.accountId === CURRENT_USER_ID && filteredFriends.length > 1 && (
                  <div className="tm-friend-hr" />
                )}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
