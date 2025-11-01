import { useEffect, useState } from 'react';

const UPDATE_INTERVAL_MS = 60000;

function useCurrentTime(): Date {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval((): void => {
      setCurrentTime(new Date());
    }, UPDATE_INTERVAL_MS);

    return (): void => {
      clearInterval(interval);
    };
  }, []);

  return currentTime;
}

export { useCurrentTime };
