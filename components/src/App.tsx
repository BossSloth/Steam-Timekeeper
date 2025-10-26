import React from 'react';
import { Container } from './Container';
import { TimeManager } from './TimeManager';
import { MockAppDataStore } from './AppDataStore/MockAppDataStore';

function App(): React.ReactNode {
  const MOCKED = true;
  const container = new Container(new MockAppDataStore(), MOCKED);

  return (
    <TimeManager container={container} />
  );
}

export default App;
