/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { findClassModule, findModuleExport } from '@steambrew/client';

export const formatRelativeDate = findModuleExport(e => e?.toString?.()?.includes('#Time_Today') === true) as (seconds: number) => string;
export const formatDuration = findModuleExport(e => e?.toString?.()?.includes('#Played_') === true) as (totalMinutes: number) => string;
export const formatPlaytime = findModuleExport(e =>
  typeof e === 'function'
  && e?.toString?.()?.includes('GetPreferredLocales') === true
  && e?.toString?.()?.includes('#Played_') === true
  && e?.toString?.()?.includes('toLocaleString') === true) as
  (
    minutes: number,
    localizationPrefix?: string,
    useSingularMinute?: boolean,
  ) => string;

export const PlayBarClasses = findClassModule(m => m?.GameStat !== undefined) as Record<string, string>;
export const HomeAppClasses = findClassModule(m => m?.PlayedRecent !== undefined && m?.PlayedTotal !== undefined) as Record<string, string>;
