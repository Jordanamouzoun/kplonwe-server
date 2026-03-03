#!/bin/bash

echo "🔄 Restauration de l'application complète..."

cd src

if [ -f "main.tsx.backup" ]; then
  cp main.tsx.backup main.tsx
  echo "✅ main.tsx restauré"
else
  cat > main.tsx << 'MAIN'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
MAIN
  echo "✅ main.tsx recréé"
fi

echo ""
echo "Application restaurée. Relancez: npm run dev"
