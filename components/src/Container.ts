import { IAppDataStore } from './AppDataStore/IAppDataStore';
import { SessionDatabase } from './TimeManager/SessionDatabase';

export class Container {
  public readonly sessionDB: SessionDatabase;

  constructor(public readonly appDataStore: IAppDataStore, mocked = false) {
    this.sessionDB = new SessionDatabase(mocked);
  }
}
