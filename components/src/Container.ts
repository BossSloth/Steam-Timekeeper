import { ISteamDataStore } from './SteamDataStore/ISteamDataStore';
import { SessionDatabase } from './TimeManager/SessionDatabase';

export class Container {
  public readonly sessionDB: SessionDatabase;

  constructor(public readonly steamDataStore: ISteamDataStore, mocked = false) {
    this.sessionDB = new SessionDatabase(mocked);
  }
}
