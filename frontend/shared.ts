import { Container } from '@components/Container';
import { Millennium } from '@steambrew/client';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import { BasicPopup } from 'steam-types/Global/managers/PopupManager';

export let mainWindow: Window;

export function initMainWindow(_mainWindow: Window): void {
  mainWindow = _mainWindow;
}

export let container: Container;

export function initContainer(_container: Container): void {
  container = _container;
}

export let componentsPublicDir: string;

export function initComponentsPublicDir(_componentsPublicDir: string): void {
  componentsPublicDir = _componentsPublicDir;
}

declare global {
  const SP_REACTDOM: typeof ReactDOM & typeof ReactDOMClient;
}

export const DESKTOP_MAIN_WINDOW_NAME = 'SP Desktop_uid0';
export const GAMEPAD_MAIN_WINDOW_NAME = 'SP BPM_uid0';
export async function WaitForElement(sel: string, parent = document): Promise<Element | undefined> {
  return [...(await Millennium.findElement(parent, sel))][0];
}

export interface ContextMenu {
  Close?(): void;
  Hide(): void;
  Show(): void;
  m_popupContextMenu: BasicPopup;
}

export function changeTagPreserveChildren(element: Element, newTag: string): HTMLElement {
  const newElement = document.createElement(newTag);

  // Copy attributes
  for (const attr of element.attributes) {
    newElement.setAttribute(attr.name, attr.value);
  }

  // Move children *except* the React mount
  while (element.firstChild) {
    newElement.appendChild(element.firstChild);
  }

  // Swap in DOM
  element.parentNode?.replaceChild(newElement, element);

  return newElement;
}
