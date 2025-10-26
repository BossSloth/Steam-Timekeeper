/* eslint-disable no-await-in-loop */
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { GameSession } from './Types';

const DB_NAME = 'SteamTimekeeperDB';
const DB_VERSION = 2;
const SESSIONS_STORE = 'sessions';
const METADATA_STORE = 'metadata';

interface TimelineMetadata {
  lastCalculated: Date;
  optimalStartHour: number;
}

interface SteamTimekeeperDB extends DBSchema {
  [METADATA_STORE]: {
    key: string;
    value: TimelineMetadata;
  };
  [SESSIONS_STORE]: {
    key: string;
    value: GameSession;
    indexes: {
      appId: string;
      startTime: Date;
      endTime: Date;
    };
  };
}

type SessionChangeListener = () => void;

class SessionDatabase {
  private db: IDBPDatabase<SteamTimekeeperDB> | null = null;

  private readonly listeners = new Set<SessionChangeListener>();

  addChangeListener(listener: SessionChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener();
    });
  }

  async initialize(): Promise<void> {
    this.db = await openDB<SteamTimekeeperDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create sessions store if it doesn't exist
        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          const sessionsStore = db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });

          // Create indexes for efficient querying
          sessionsStore.createIndex('appId', 'appId', { unique: false });
          sessionsStore.createIndex('startTime', 'startTime', { unique: false });
          sessionsStore.createIndex('endTime', 'endTime', { unique: false });
        }

        // Create metadata store if it doesn't exist
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE);
        }
      },
    });
  }

  async addSession(session: GameSession): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const id = await this.db.add(SESSIONS_STORE, session);

    // Recalculate optimal start hour after adding session
    await this.recalculateOptimalStartHour();
    this.notifyListeners();

    return id;
  }

  async addSessions(sessions: GameSession[]): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = this.db.transaction(SESSIONS_STORE, 'readwrite');
    await Promise.all([
      ...sessions.map(async session => tx.store.add(session)),
      tx.done,
    ]);

    // Recalculate optimal start hour after adding sessions
    await this.recalculateOptimalStartHour();
    this.notifyListeners();
  }

  async getSession(id: string): Promise<GameSession | undefined> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.db.get(SESSIONS_STORE, id);
  }

  async getAllSessions(): Promise<GameSession[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.db.getAll(SESSIONS_STORE);
  }

  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<GameSession[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = this.db.transaction(SESSIONS_STORE, 'readonly');
    const index = tx.store.index('startTime');
    const sessions: GameSession[] = [];

    let cursor = await index.openCursor();

    while (cursor) {
      const session = cursor.value;
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);

      // Include session if it overlaps with the date range
      if (sessionStart >= startDate && sessionEnd <= endDate) {
        sessions.push(session);
      }

      cursor = await cursor.continue();
    }

    return sessions;
  }

  async updateSession(session: GameSession): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.put(SESSIONS_STORE, session);

    await this.recalculateOptimalStartHour();
    this.notifyListeners();
  }

  async deleteSession(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.delete(SESSIONS_STORE, id);

    await this.recalculateOptimalStartHour();
    this.notifyListeners();
  }

  async clearAllSessions(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.clear(SESSIONS_STORE);

    await this.recalculateOptimalStartHour();
    this.notifyListeners();
  }

  async getSessionCount(): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.db.count(SESSIONS_STORE);
  }

  private static calculateOptimalStartHour(sessions: GameSession[]): number {
    if (sessions.length === 0) {
      return 0;
    }

    // Count session activity for each hour of the day
    const hourActivity = new Array(24).fill(0) as number[];

    sessions.forEach((session) => {
      const startHour = session.startTime.getHours();
      const endHour = session.endTime.getHours();
      const startTime = session.startTime.getTime();
      const endTime = session.endTime.getTime();
      const duration = (endTime - startTime) / (1000 * 60 * 60); // in hours

      // Check if session spans midnight
      const spansMidnight = endHour < startHour || (endHour === startHour && endTime > startTime);

      if (spansMidnight) {
        // Add activity from start hour to midnight
        for (let h = startHour; h < 24; h++) {
          hourActivity[h]++;
        }
        // Add activity from midnight to end hour
        for (let h = 0; h <= endHour; h++) {
          hourActivity[h]++;
        }
      } else {
        // Normal case: add activity for each hour in the session
        const sessionHours = Math.ceil(duration);
        for (let i = 0; i < sessionHours && startHour + i < 24; i++) {
          hourActivity[(startHour + i) % 24]++;
        }
      }
    });

    // Find the hour with least activity (likely sleep time)
    let minActivity = Infinity;
    let quietestHour = 0;

    for (let hour = 0; hour < 24; hour++) {
      if (hourActivity[hour] < minActivity) {
        minActivity = hourActivity[hour];
        quietestHour = hour;
      }
    }

    // Start timeline 3 hours after the quietest hour
    const startHour = (quietestHour + 3) % 24;

    return startHour;
  }

  async recalculateOptimalStartHour(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const allSessions = await this.getAllSessions();
    const optimalStartHour = SessionDatabase.calculateOptimalStartHour(allSessions);

    await this.db.put(METADATA_STORE, {
      lastCalculated: new Date(),
      optimalStartHour,
    }, 'timeline');
  }

  async getOptimalStartHour(): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const metadata = await this.db.get(METADATA_STORE, 'timeline');

    if (metadata) {
      return metadata.optimalStartHour;
    }

    // If no metadata exists, calculate and store it
    await this.recalculateOptimalStartHour();
    const newMetadata = await this.db.get(METADATA_STORE, 'timeline');

    return newMetadata?.optimalStartHour ?? 0;
  }
}

// Export a singleton instance
export const sessionDB = new SessionDatabase();
