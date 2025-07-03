import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import required Konva shapes to register them
import 'konva/lib/shapes/Circle';
import 'konva/lib/shapes/Rect';
import 'konva/lib/shapes/Line';
import 'konva/lib/shapes/Text';
import 'konva/lib/shapes/Arc';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);