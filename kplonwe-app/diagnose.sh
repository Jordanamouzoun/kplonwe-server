#!/bin/bash

echo "🔍 DIAGNOSTIC FRONTEND - PAGE BLANCHE"
echo ""
echo "1. Vérification fichiers créés..."

# Vérifier que les fichiers existent
if [ -f "src/pages/teachers/TeachersSearchPage.tsx" ]; then
  echo "✅ TeachersSearchPage.tsx existe"
else
  echo "❌ TeachersSearchPage.tsx MANQUANT"
fi

if [ -f "src/pages/teacher/TeacherProfilePage.tsx" ]; then
  echo "✅ TeacherProfilePage.tsx existe"
else
  echo "❌ TeacherProfilePage.tsx MANQUANT"
fi

echo ""
echo "2. Vérification syntaxe TypeScript..."

# Essayer de compiler
npx tsc --noEmit 2>&1 | head -20

echo ""
echo "3. Fichiers routes..."
ls -la src/routes/

