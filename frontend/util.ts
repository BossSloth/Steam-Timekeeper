import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Render a React component to a DOM element
 * @param component The component to render
 * @returns The DOM element that was rendered
 */
export function renderComponent(component: React.ReactNode, tagName = 'div'): HTMLElement {
  const container = document.createElement(tagName);
  const root = createRoot(container);
  root.render(component);

  return container;
}

export interface Fiber {
  memoizedState?: {
    queue?: {
      dispatch(state: unknown): void;
    };
  } & Fiber;
  pendingProps: Record<string, unknown>;
  return?: Fiber;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type?: React.FC<any>;
}

export function getReactFiberFromNode(node: Element): Fiber | null {
  const key = Object.keys(node).find(k => k.startsWith('__reactFiber'));
  if (key === undefined) {
    return null;
  }

  return (node as unknown as Record<string, unknown>)[key] as Fiber | undefined ?? null;
}
