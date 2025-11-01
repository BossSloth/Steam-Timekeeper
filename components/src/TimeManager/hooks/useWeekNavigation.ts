import { useCallback, useMemo, useState } from 'react';
import { getMonday } from '../utils';

function useWeekNavigation(initialDate = new Date()): {
  weekEnd: Date;
  weekStart: Date;
  navigateWeek(offset: number): void;
  goToToday(): void;
} {
  const [weekStart, setWeekStart] = useState(() => getMonday(initialDate));

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);

    return end;
  }, [weekStart]);

  const navigateWeek = useCallback((offset: number) => {
    setWeekStart((prev) => {
      const newWeek = new Date(prev);
      newWeek.setDate(prev.getDate() + offset * 7);

      return newWeek;
    });
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getMonday(new Date()));
  }, []);

  return { weekStart, weekEnd, navigateWeek, goToToday };
}

export { useWeekNavigation };
