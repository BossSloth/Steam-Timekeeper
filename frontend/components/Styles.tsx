import { constSysfsExpr } from '@steambrew/client';
import React from 'react';

const styles = constSysfsExpr('steam-timekeeper.css', { basePath: '../../public' }).content;

export function Styles(): React.JSX.Element {
  return <style>{styles}</style>;
}
