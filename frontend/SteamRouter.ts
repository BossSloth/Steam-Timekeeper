/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { findModuleExport } from '@steambrew/client';
import { NavigationStore } from 'steam-types/Global/stores/NavigationStore';

const navigationStore = findModuleExport(e =>
  typeof e?.UpdateRoutingInfo === 'function'
  && typeof e?.BRouteMatch === 'function'
  && e?.UpdateRoutingInfo?.toString?.()?.includes('m_locationPathname') === true) as NavigationStore;

async function waitForHistory(store: NavigationStore): Promise<void> {
  return new Promise((resolve) => {
    if (store.m_history) {
      resolve();

      return;
    }
    const interval = setInterval(() => {
      if (store.m_history) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

export const appIdPageRegex = /^\/library\/app\/(\d+)/;
export const homePageRegex = /^\/library\/home$/;

export async function setupLibraryRouteListener(
  routeRegex: RegExp,
  onRouteMatch: (matches: RegExpMatchArray) => void,
): Promise<() => void> {
  await waitForHistory(navigationStore);

  // Check current route immediately
  const currentMatch = navigationStore.m_locationPathname.match(routeRegex);
  if (currentMatch !== null) {
    onRouteMatch(currentMatch);
  }

  let lastPathName = '';

  // Listen for future changes
  const unlisten = navigationStore.m_history?.listen((location) => {
    // Debounce the same pathname as steam calls this many times for each news article and other things
    if (location.pathname === lastPathName) {
      return;
    }

    lastPathName = location.pathname;
    const match = location.pathname.match(routeRegex);
    if (match !== null) {
      onRouteMatch(match);
    }
  });

  if (!unlisten) {
    throw new Error('Failed to setup library route listener');
  }

  return unlisten;
}
