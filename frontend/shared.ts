import { Millennium } from '@steambrew/client';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import { BasicPopup } from 'steam-types/Global/PopupManager';

export let mainWindow: Window;

export function initMainWindow(_mainWindow: Window): void {
  mainWindow = _mainWindow;
}

declare global {
  const SP_REACTDOM: typeof ReactDOM & typeof ReactDOMClient;
}

export const MAIN_WINDOW_NAME = 'SP Desktop_uid0';
export async function WaitForElement(sel: string, parent = document): Promise<Element | undefined> {
  return [...(await Millennium.findElement(parent, sel))][0];
}

export interface ContextMenu {
  Close?(): void;
  Hide(): void;
  Show(): void;
  m_popupContextMenu: BasicPopup;
}

export async function loadScript(src: string, document: Document, attributes?: NamedNodeMap, module?: boolean): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', src);

    if (attributes) {
      for (const attribute of attributes) {
        script.setAttribute(attribute.name, attribute.value);
      }
    }

    if (module === true) {
      script.setAttribute('type', 'module');
    }

    script.addEventListener('load', () => {
      resolve();
    });

    script.addEventListener('error', () => {
      reject(new Error(`Failed to load script "${src}" for document "${document.title}"`));
    });

    document.head.appendChild(script);
  });
}

export function loadScriptSync(src: string, document: Document): void {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', src, false);
  xhr.send();
  const script = document.createElement('script');
  script.textContent = `${xhr.responseText}\n//# sourceURL=${src}`;
  document.head.appendChild(script);
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
