/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { findModuleExport } from '@steambrew/client';

export const PlayTimeIcon = findModuleExport(e => e?.toString()?.includes('SVGIcon_PlayTime') === true) as React.FC;
