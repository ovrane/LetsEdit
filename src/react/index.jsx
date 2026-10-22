import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

export function mountReactApp(container) {
  if (!container) return null;
  const root = createRoot(container);
  root.render(<App />);
  return root;
}
