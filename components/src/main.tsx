/* eslint-disable @stylistic/function-paren-newline */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.scss';

createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> // Strict mode is stupid
  <App />,
  // </React.StrictMode>,
);
