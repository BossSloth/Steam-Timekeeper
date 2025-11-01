import React, { useEffect, useState } from 'react';
import { MockAppDataStore } from './AppDataStore/MockAppDataStore';
import { Container } from './Container';
import { TimeManager } from './TimeManager';

const MOCKED = true;
const container = new Container(new MockAppDataStore(), MOCKED);

// Initialize database at module level to prevent double initialization
let initPromise: Promise<void> | null = null;
if (!container.sessionDB.isDatabaseInitialized()) {
  initPromise = container.sessionDB.initialize();
}

function App(): React.ReactNode {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initPromise) {
      initPromise.then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <TimeManager container={container} />
  );
}

export default App;
