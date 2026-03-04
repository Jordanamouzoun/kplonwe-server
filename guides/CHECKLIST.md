# ✅ CHECKLIST DÉPLOIEMENT KPLONWE

## 📋 AVANT DE COMMENCER

- [ ] Compte Render créé (gratuit)
- [ ] Compte Vercel créé (gratuit)
- [ ] Repos GitHub pushés (backend + frontend)
- [ ] Clés Stripe prêtes (optionnel pour l'instant)

---

## 🗄️ BACKEND (30 min)

### Préparer les fichiers (5 min)
- [ ] Copier `build.sh` à la racine du repo backend
- [ ] Remplacer `prisma/schema.prisma` avec `schema.prisma.postgresql`
- [ ] Créer `.env.example` à la racine
- [ ] Vérifier `package.json` (scripts + engines)
- [ ] Push vers GitHub

### Render - Base de données (5 min)
- [ ] Créer PostgreSQL Database
- [ ] Name: `kplonwe-db`
- [ ] Region: Frankfurt (ou proche)
- [ ] Plan: Free
- [ ] **COPIER l'Internal Database URL**

### Render - Web Service (15 min)
- [ ] Créer Web Service
- [ ] Connecter le repo `kplonwe-server`
- [ ] Build Command: `./build.sh`
- [ ] Start Command: `npm start`
- [ ] Ajouter toutes les variables d'environnement :
  - [ ] DATABASE_URL (celle copiée)
  - [ ] JWT_SECRET (généré)
  - [ ] JWT_REFRESH_SECRET (généré)
  - [ ] FRONTEND_URL (temporaire)
  - [ ] CORS_ORIGIN (temporaire)
  - [ ] PORT = 5000
  - [ ] NODE_ENV = production
- [ ] Déployer et attendre "Your service is live"
- [ ] **NOTER l'URL** : https://kplonwe-api.onrender.com

### Créer l'admin (5 min)
- [ ] Ouvrir le Shell Render
- [ ] Lancer : `npm run create-admin`
- [ ] **NOTER les identifiants**

---

## 🎨 FRONTEND (15 min)

### Préparer les fichiers (5 min)
- [ ] Copier `vercel.json` à la racine du repo frontend
- [ ] Créer `.env.production` avec l'URL backend
- [ ] Vérifier `src/lib/api.ts`
- [ ] Push vers GitHub

### Vercel - Déploiement (10 min)
- [ ] Importer le projet depuis GitHub
- [ ] Framework: Vite (auto-détecté)
- [ ] Ajouter les variables d'environnement :
  - [ ] VITE_API_URL = https://kplonwe-api.onrender.com/api/v1
  - [ ] VITE_APP_NAME = KPLONWE
- [ ] Déployer
- [ ] **NOTER l'URL** : https://kplonwe-xxxxx.vercel.app

---

## 🔗 CONNECTER (5 min)

### Mettre à jour le CORS
- [ ] Retour sur Render
- [ ] Service `kplonwe-api` → Environment
- [ ] Modifier FRONTEND_URL avec l'URL Vercel exacte
- [ ] Modifier CORS_ORIGIN avec l'URL Vercel exacte
- [ ] Save (redémarre automatiquement)

---

## ✅ TESTS (10 min)

- [ ] Backend health check : https://kplonwe-api.onrender.com/health
- [ ] Frontend charge : https://kplonwe-xxxxx.vercel.app
- [ ] Connexion admin fonctionne
- [ ] Créer un compte test fonctionne
- [ ] L'admin voit le nouveau compte

---

## 🎉 SUCCÈS !

Si tous les tests passent, félicitations ! Ton app est en production.

### Mes URLs :
- Frontend : ______________________________
- Backend : ______________________________
- Admin email : ______________________________
- Admin password : ______________________________

---

## 📞 EN CAS DE PROBLÈME

1. **Backend ne démarre pas** :
   - Check les logs Render
   - Vérifier DATABASE_URL
   - Clear build cache & redeploy

2. **CORS error** :
   - Vérifier CORS_ORIGIN = URL Vercel exacte
   - Pas de `/` à la fin
   - Redémarrer le service Render

3. **Frontend error** :
   - Check build logs Vercel
   - Vérifier VITE_API_URL
   - Console (F12) pour voir l'erreur exacte

4. **Base de données error** :
   - Vérifier que la DB est "Available"
   - Vérifier les migrations : Shell → `npx prisma migrate deploy`

**Bonne chance ! 🚀**
