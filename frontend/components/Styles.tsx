import { constSysfsExpr } from '@steambrew/client';
import React from 'react';
import { componentsPublicDir } from 'shared';

const styles = constSysfsExpr('steam-timekeeper.css', { basePath: '../../public' }).content;

export function Styles(): React.JSX.Element {
  return <style>{replaceStylePaths()}</style>;
}

function replaceStylePaths(): string {
  return styles.replace(/url\("\//g, `url("https://js.millennium.app/${componentsPublicDir}/`);
}
