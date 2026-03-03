# 🚀 INSTALLATION - PHASES 6 & 7

## 📦 Contenu du ZIP

- `server/` - Backend Node.js + Prisma
- `educonnect-app/` - Frontend React + TypeScript
- `README_PHASES6-7.md` - Documentation complète
- `INSTALLATION_PHASES6-7.md` - Ce fichier

---

## ⚡ INSTALLATION RAPIDE

### 1. Backend

```bash
cd server

# Installer dépendances
npm install

# Générer client Prisma avec nouveaux modèles
npx prisma generate

# Créer tables en base de données
npx prisma db push

# Démarrer serveur
npm run dev
```

✅ Backend démarré sur `http://localhost:5000`

---

### 2. Frontend

```bash
cd educonnect-app

# Installer dépendances
npm install

# Démarrer application
npm run dev
```

✅ Frontend démarré sur `http://localhost:5173`

---

## 🔧 NOUVEAUTÉS PHASES 6-7

### Phase 6 - Profils Professeurs

**Routes ajoutées:**
- `/teachers/:id` - Profil public professeur
- `/teacher/profile/edit` - Édition profil (à implémenter frontend)
- `/teacher/documents` - Gestion diplômes (à implémenter frontend)

**Endpoints API:**
```
GET    /api/v1/teachers/:teacherId/profile
GET    /api/v1/teachers/profile
PUT    /api/v1/teachers/profile
POST   /api/v1/teachers/documents
GET    /api/v1/teachers/documents
DELETE /api/v1/teachers/documents/:id
```

### Phase 7 - Quiz Évaluation

**Routes ajoutées (backend prêt, frontend à implémenter):**
- `/school/evaluation/create` - Création quiz
- `/school/evaluation/:id/results` - Résultats
- `/teacher/evaluations` - Liste quiz
- `/teacher/evaluations/:id/take` - Passer quiz

**Endpoints API:**
```
# Écoles
POST   /api/v1/evaluation/quizzes
POST   /api/v1/evaluation/quizzes/:id/assign
GET    /api/v1/evaluation/quizzes/:id/results

# Professeurs
GET    /api/v1/evaluation/assignments
GET    /api/v1/evaluation/quizzes/:id
POST   /api/v1/evaluation/quizzes/:id/submit
```

---

## 🧪 TESTER LES FONCTIONNALITÉS

### Test 1: Voir Profil Professeur

1. Créer compte professeur
2. Se connecter
3. Aller sur `/teachers/:id` (remplacer :id par l'ID du professeur)
4. Voir profil public avec statut, matières, bio

### Test 2: Limite Quiz École (Backend)

```bash
# Tester avec Postman ou curl

# 1. Login école (gratuite)
POST http://localhost:5000/api/v1/auth/login
{
  "email": "ecole@test.com",
  "password": "Password123!"
}

# 2. Créer 7 quiz (OK)
POST http://localhost:5000/api/v1/evaluation/quizzes
Headers: Authorization: Bearer <token>
{
  "title": "Quiz 1",
  "questions": [...]
}

# 3. Créer 8ème quiz (REFUSÉ)
POST http://localhost:5000/api/v1/evaluation/quizzes
→ Retour: 403 "Limite mensuelle atteinte (7 quiz)"
```

---

## 📝 MODÈLES AJOUTÉS

### Base de données

Nouveaux modèles Prisma:
- `TeacherDocument` - Documents professeurs
- `EvaluationQuiz` - Quiz d'évaluation
- `EvaluationQuestion` - Questions quiz
- `EvaluationAssignment` - Attribution quiz

**Vérifier création:**
```bash
cd server
npx prisma studio
# → Voir tables dans l'interface
```

---

## ♿ ACCESSIBILITÉ

### Tester avec lecteur d'écran

**NVDA (Windows):**
```
1. Télécharger: https://www.nvaccess.org/
2. Installer et activer
3. Naviguer dans l'app avec Tab
4. Vérifier annonces vocales
```

**VoiceOver (Mac):**
```
1. Cmd + F5 pour activer
2. Naviguer avec Tab
3. Vérifier annonces vocales
```

**Points à tester:**
- Profil professeur: Statut annoncé
- Navigation clavier complète
- Boutons avec aria-label
- Messages erreur vocalisés

---

## 🐛 DÉPANNAGE

### Erreur Prisma

```bash
# Régénérer client
cd server
npx prisma generate
```

### Port déjà utilisé

```bash
# Backend
# Changer PORT dans server/.env

# Frontend
# Vite détecte automatiquement port libre
```

### Base de données corrompue

```bash
cd server
rm -f prisma/dev.db
npx prisma db push
```

---

## 📚 DOCUMENTATION

Voir `README_PHASES6-7.md` pour:
- Architecture technique complète
- Règles métier
- Scénarios de test
- Guide accessibilité
- Endpoints API détaillés

---

**✅ INSTALLATION TERMINÉE**

Backend + Frontend prêts pour phases 6 & 7.  
Consulter README pour utilisation complète.
