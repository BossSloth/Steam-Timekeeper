import React from 'react';
import { Container } from './Container';
import { TimeManager } from './TimeManager';

function App(): React.ReactNode {
  const MOCKED = true;
  const container = new Container(MOCKED);

  return (
    <TimeManager container={container} />
  );
}

export default App;
