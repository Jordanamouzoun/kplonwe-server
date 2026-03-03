import fs from 'fs';
import path from 'path';

const uploadDirs = [
  'uploads',
  'uploads/documents',
  'uploads/avatars',
];

console.log('🔍 Vérification dossiers uploads...');

uploadDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Créé: ${dir}`);
  } else {
    console.log(`✓ Existe: ${dir}`);
  }
});

console.log('✅ Tous les dossiers uploads sont prêts\n');
