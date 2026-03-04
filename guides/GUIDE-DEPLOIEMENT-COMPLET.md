# 🚀 GUIDE COMPLET DE DÉPLOIEMENT KPLONWE

## 📋 Table des matières
1. [Pré-requis](#pré-requis)
2. [Déploiement Backend (Render)](#déploiement-backend-render)
3. [Déploiement Frontend (Vercel)](#déploiement-frontend-vercel)
4. [Configuration Post-Déploiement](#configuration-post-déploiement)
5. [Tests & Vérification](#tests--vérification)
6. [Dépannage](#dépannage)

---

## 🎯 Pré-requis

### Comptes nécessaires
- ✅ Compte GitHub (pour les repos)
- ✅ Compte Vercel (gratuit : https://vercel.com/signup)
- ✅ Compte Render (gratuit : https://render.com/register)
- ✅ Compte Stripe (pour les paiements : https://dashboard.stripe.com/register)

### Repos GitHub
Vous devez avoir 2 repos séparés :
```
votre-github/kplonwe-frontend  → Code du frontend
votre-github/kplonwe-backend   → Code du backend
```

---

## 🔧 PARTIE 1 : DÉPLOIEMENT BACKEND (Render)

### Étape 1.1 : Préparer le backend

#### 1. Remplacer le schema Prisma

Dans votre repo `kplonwe-backend`, remplacez `prisma/schema.prisma` par le fichier PostgreSQL :

**Fichier fourni** : `schema.prisma.postgresql`

```bash
# Dans votre repo local
cd kplonwe-backend
cp schema.prisma.postgresql prisma/schema.prisma
```

**Pourquoi ?** Render ne supporte pas SQLite. On passe à PostgreSQL.

#### 2. Créer le fichier .env.example

Créez `.env.example` à la racine avec :

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
FRONTEND_URL="https://your-app.vercel.app"
CORS_ORIGIN="https://your-app.vercel.app"
PORT=5000
NODE_ENV="production"
```

#### 3. Vérifier package.json

Assurez-vous que `package.json` contient :

```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "prisma generate && prisma migrate deploy"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 4. Créer un script de build

Créez `build.sh` à la racine :

```bash
#!/bin/bash
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "✅ Build complete!"
```

Rendez-le exécutable :
```bash
chmod +x build.sh
```

#### 5. Push vers GitHub

```bash
git add .
git commit -m "🚀 Prepare for Render deployment"
git push origin main
```

---

### Étape 1.2 : Créer la base de données PostgreSQL sur Render

1. **Connectez-vous à Render** : https://dashboard.render.com

2. **Créez une nouvelle PostgreSQL Database** :
   - Cliquez sur "New +" → "PostgreSQL"
   - **Name** : `kplonwe-db`
   - **Database** : `kplonwe`
   - **User** : `kplonwe_user`
   - **Region** : Choisissez la plus proche (ex: Frankfurt)
   - **Plan** : Free (pour commencer)

3. **Notez l'URL de connexion** :
   - Render va générer : `postgresql://kplonwe_user:xxxxx@xxxx.render.com:5432/kplonwe`
   - **COPIEZ CETTE URL** → vous en aurez besoin !

4. **Attendez que le statut soit "Available"** (1-2 minutes)

---

### Étape 1.3 : Déployer le backend sur Render

1. **Créez un nouveau Web Service** :
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre compte GitHub si ce n'est pas déjà fait
   - Sélectionnez le repo `kplonwe-backend`

2. **Configuration du service** :
   - **Name** : `kplonwe-api`
   - **Region** : Même région que la DB
   - **Branch** : `main`
   - **Root Directory** : (laisser vide)
   - **Runtime** : `Node`
   - **Build Command** : `./build.sh`
   - **Start Command** : `npm start`
   - **Plan** : Free (pour commencer)

3. **Variables d'environnement** :
   Cliquez sur "Advanced" → "Add Environment Variable"

   Ajoutez TOUTES ces variables :

   ```
   DATABASE_URL = postgresql://kplonwe_user:xxxxx@xxxx.render.com:5432/kplonwe
   (utilisez l'URL que vous avez copiée plus tôt)

   JWT_SECRET = [générer un secret fort - voir ci-dessous]
   JWT_REFRESH_SECRET = [générer un autre secret fort]
   
   FRONTEND_URL = https://kplonwe.vercel.app
   (vous mettrez l'URL exacte après le déploiement frontend)
   
   CORS_ORIGIN = https://kplonwe.vercel.app
   
   PORT = 5000
   NODE_ENV = production
   
   STRIPE_SECRET_KEY = sk_live_...
   (vos vraies clés Stripe de production)
   
   STRIPE_PUBLISHABLE_KEY = pk_live_...
   ```

   **Pour générer les secrets JWT** :
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Lancez cette commande 2 fois pour avoir 2 secrets différents.

4. **Créer le service** :
   - Cliquez sur "Create Web Service"
   - Render va cloner votre repo et déployer
   - **Attendez 5-10 minutes** pour le premier déploiement

5. **Vérifiez le déploiement** :
   - Allez dans "Logs" pour voir l'avancement
   - Attendez le message "✅ Build complete!"
   - Votre API sera disponible à : `https://kplonwe-api.onrender.com`

---

## 🎨 PARTIE 2 : DÉPLOIEMENT FRONTEND (Vercel)

### Étape 2.1 : Préparer le frontend

#### 1. Créer vercel.json

Dans votre repo `kplonwe-frontend`, créez `vercel.json` à la racine :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 2. Créer .env.production

Créez `.env.production` à la racine :

```bash
VITE_API_URL=https://kplonwe-api.onrender.com/api/v1
VITE_APP_NAME=KPLONWE
```

**Important** : Remplacez `kplonwe-api.onrender.com` par votre vraie URL Render !

#### 3. Vérifier src/lib/api.ts

Ouvrez `src/lib/api.ts` et vérifiez que l'URL de l'API utilise la variable d'environnement :

```typescript
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 4. Push vers GitHub

```bash
git add .
git commit -m "🚀 Prepare for Vercel deployment"
git push origin main
```

---

### Étape 2.2 : Déployer sur Vercel

1. **Connectez-vous à Vercel** : https://vercel.com/login

2. **Importez votre projet** :
   - Cliquez sur "Add New..." → "Project"
   - Importez le repo `kplonwe-frontend`
   - Cliquez sur "Import"

3. **Configuration** :
   - **Framework Preset** : Vite (auto-détecté)
   - **Root Directory** : (laisser vide)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

4. **Variables d'environnement** :
   Ajoutez :
   ```
   VITE_API_URL = https://kplonwe-api.onrender.com/api/v1
   VITE_APP_NAME = KPLONWE
   ```

5. **Déployer** :
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes
   - Votre site sera disponible à : `https://kplonwe-xxxxx.vercel.app`

6. **Configurer un domaine personnalisé** (optionnel) :
   - Allez dans "Settings" → "Domains"
   - Ajoutez votre domaine (ex: `kplonwe.com`)

---

## 🔗 PARTIE 3 : CONFIGURATION POST-DÉPLOIEMENT

### Étape 3.1 : Mettre à jour le CORS

**IMPORTANT** : Une fois le frontend déployé, vous avez l'URL exacte (ex: `https://kplonwe-xxxxx.vercel.app`)

1. **Retournez sur Render** :
   - Allez dans votre service `kplonwe-api`
   - "Environment" → Éditez les variables :
   ```
   FRONTEND_URL = https://kplonwe-xxxxx.vercel.app
   CORS_ORIGIN = https://kplonwe-xxxxx.vercel.app
   ```
   - Sauvegardez → Le service va redémarrer

### Étape 3.2 : Créer l'admin par défaut

1. **Ouvrez un Shell Render** :
   - Dans votre service `kplonwe-api`
   - Cliquez sur "Shell" en haut à droite

2. **Créez l'administrateur** :
   ```bash
   npm run create-admin
   ```

   Ou manuellement :
   ```bash
   node scripts/create-admin.js
   ```

3. **Notez les identifiants** :
   ```
   Email: admin@kplonwe.com
   Password: (celui que vous avez défini dans .env)
   ```

---

## ✅ PARTIE 4 : TESTS & VÉRIFICATION

### Test 1 : Backend

Testez l'API :
```bash
curl https://kplonwe-api.onrender.com/health
```

Résultat attendu :
```json
{"status":"ok","message":"Server is running"}
```

### Test 2 : Frontend

1. Ouvrez : `https://kplonwe-xxxxx.vercel.app`
2. Cliquez sur "Se connecter"
3. Connectez-vous avec l'admin :
   - Email : `admin@kplonwe.com`
   - Password : (votre mot de passe)

### Test 3 : Inscription

1. Créez un nouveau compte enseignant
2. Vérifiez que les données apparaissent dans l'admin

---

## 🐛 PARTIE 5 : DÉPANNAGE

### Problème : "Cannot connect to database"

**Solution** :
1. Vérifiez que la DB Render est "Available"
2. Vérifiez que `DATABASE_URL` est correct
3. Relancez le build : Render → Manual Deploy → "Clear build cache & deploy"

### Problème : "CORS error"

**Solution** :
1. Vérifiez que `CORS_ORIGIN` contient la bonne URL Vercel
2. Pas de `/` à la fin de l'URL !
3. Redémarrez le service Render

### Problème : "401 Unauthorized"

**Solution** :
1. Vérifiez que les `JWT_SECRET` sont les mêmes qu'au moment de la création du token
2. Déconnectez-vous et reconnectez-vous

### Problème : Frontend ne charge pas

**Solution** :
1. Vérifiez les logs Vercel : Vercel → Deployments → Cliquez sur le dernier → "Build Logs"
2. Vérifiez que `VITE_API_URL` est correct
3. Ouvrez la console (F12) pour voir les erreurs

---

## 📊 MONITORING

### Render (Backend)

- **Logs** : Render Dashboard → Service → Logs
- **Metrics** : Render Dashboard → Service → Metrics
- **Uptime** : Gratuit jusqu'à 750h/mois, puis idle après 15min d'inactivité

### Vercel (Frontend)

- **Analytics** : Vercel Dashboard → Project → Analytics
- **Logs** : Vercel Dashboard → Project → Deployments → Logs

---

## 🔐 SÉCURITÉ

### Checklist de sécurité :

- ✅ Secrets JWT forts (64+ caractères)
- ✅ Clés Stripe de **production** (pas de test en prod !)
- ✅ CORS configuré avec l'URL exacte
- ✅ Mot de passe admin changé après le premier login
- ✅ HTTPS activé (automatique sur Render et Vercel)
- ✅ Variables d'environnement jamais committées dans Git

---

## 🎉 FÉLICITATIONS !

Votre application KPLONWE est maintenant **DÉPLOYÉE EN PRODUCTION** ! 🚀

### URLs de production :
- **Frontend** : `https://kplonwe-xxxxx.vercel.app`
- **Backend** : `https://kplonwe-api.onrender.com`
- **Admin** : `https://kplonwe-xxxxx.vercel.app/login`

### Prochaines étapes :
1. Configurez un nom de domaine personnalisé
2. Activez les paiements Stripe en production
3. Configurez les emails SMTP
4. Ajoutez du monitoring (Sentry, LogRocket)
5. Configurez les backups de la base de données

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :
1. Vérifiez les logs (Render + Vercel)
2. Consultez ce guide
3. Vérifiez la section Dépannage

**Bon déploiement ! 🎯**
