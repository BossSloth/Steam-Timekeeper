export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';

  return `${hour - 12} PM`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return monday;
}

export function getDateAtMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return d;
}

export function getDateAtEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);

  return d;
}
