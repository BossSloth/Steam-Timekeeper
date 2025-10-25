import React from 'react';
import { MOCK_SESSIONS, TimeManager } from './TimeManager';

function App(): React.ReactNode {
  return (
    <TimeManager sessions={MOCK_SESSIONS} />
  );
}

export default App;
