import { SessionDatabase } from './TimeManager/SessionDatabase';

export class Container {
  public readonly sessionDatabase: SessionDatabase;

  constructor(mocked = false) {
    this.sessionDatabase = new SessionDatabase(mocked);
  }
}
