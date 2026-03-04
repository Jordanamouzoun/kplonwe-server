# 🚀 DÉPLOIEMENT KPLONWE - GUIDE SIMPLE

## ✅ CE QU'ON VA FAIRE

1. **Backend sur Render** (avec PostgreSQL)
2. **Frontend sur Vercel**
3. **Tout connecter ensemble**

**Durée totale : 30 minutes**

---

## 📦 ÉTAPE 1 : PRÉPARER LE BACKEND

### 1.1 - Mettre à jour votre repo backend

Dans votre repo GitHub `kplonwe-server`, ajoutez ces fichiers :

#### Fichier 1 : `build.sh` (à la racine)
```bash
#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Build complete!"
```

Rendez-le exécutable :
```bash
chmod +x build.sh
```

#### Fichier 2 : `prisma/schema.prisma` (remplacer l'ancien)

**Important** : SQLite ne marche PAS sur Render. On passe à PostgreSQL.

Utilisez le fichier `schema.prisma.postgresql` fourni dans ce ZIP.

```bash
cp schema.prisma.postgresql prisma/schema.prisma
```

#### Fichier 3 : `.env.example` (à la racine)
```bash
# Production Environment Variables
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-64-char-secret-here"
JWT_REFRESH_SECRET="your-64-char-secret-here"
FRONTEND_URL="https://your-app.vercel.app"
CORS_ORIGIN="https://your-app.vercel.app"
PORT=5000
NODE_ENV="production"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### 1.2 - Vérifier package.json

Ouvrez `package.json` et vérifiez que vous avez :

```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "prisma generate",
    "dev": "nodemon src/server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 1.3 - Push vers GitHub

```bash
git add .
git commit -m "🚀 Ready for production deployment"
git push origin main
```

---

## 🗄️ ÉTAPE 2 : CRÉER LA BASE DE DONNÉES

### 2.1 - Aller sur Render

1. Allez sur https://dashboard.render.com
2. Connectez-vous (ou créez un compte gratuit)

### 2.2 - Créer une PostgreSQL Database

1. Cliquez sur **"New +"** → **"PostgreSQL"**
2. Remplissez :
   - **Name** : `kplonwe-db`
   - **Database** : `kplonwe`
   - **User** : `kplonwe_user`
   - **Region** : `Frankfurt` (ou le plus proche de vous)
   - **PostgreSQL Version** : 16
   - **Datadog API Key** : (laisser vide)
   - **Plan** : **Free**

3. Cliquez sur **"Create Database"**

4. **ATTENDEZ** que le statut passe à **"Available"** (1-2 minutes)

5. **COPIEZ L'URL** :
   - Allez dans l'onglet "Info"
   - Copiez **"Internal Database URL"**
   - Format : `postgresql://kplonwe_user:xxxxx@dpg-xxxxx/kplonwe`
   - **GARDEZ CETTE URL PRÉCIEUSEMENT** ⚠️

---

## 🖥️ ÉTAPE 3 : DÉPLOYER LE BACKEND

### 3.1 - Créer le Web Service

1. Toujours sur Render, cliquez sur **"New +"** → **"Web Service"**

2. **Connect votre GitHub** si pas déjà fait

3. **Sélectionnez** le repo `kplonwe-server`

### 3.2 - Configuration

Remplissez :

- **Name** : `kplonwe-api`
- **Region** : **Frankfurt** (même que la DB)
- **Branch** : `main`
- **Root Directory** : (laisser vide)
- **Runtime** : `Node`
- **Build Command** : `./build.sh`
- **Start Command** : `npm start`
- **Plan** : **Free**

### 3.3 - Variables d'environnement

Cliquez sur **"Advanced"** pour dérouler.

Cliquez sur **"Add Environment Variable"** et ajoutez UNE PAR UNE :

| Clé | Valeur |
|-----|--------|
| `DATABASE_URL` | `postgresql://kplonwe_user:xxxxx@dpg-xxxxx/kplonwe` |
| `JWT_SECRET` | [Voir ci-dessous comment générer] |
| `JWT_REFRESH_SECRET` | [Un autre secret] |
| `FRONTEND_URL` | `https://kplonwe.vercel.app` (on changera après) |
| `CORS_ORIGIN` | `https://kplonwe.vercel.app` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

**Comment générer les JWT secrets** :

Sur votre terminal local :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Lancez cette commande 2 fois pour avoir 2 secrets différents.

### 3.4 - Créer le service

1. Cliquez sur **"Create Web Service"**
2. Render va commencer le déploiement
3. **Surveillez les logs** → Vous devriez voir :
   ```
   🔧 Installing dependencies...
   🔧 Generating Prisma Client...
   🔄 Running database migrations...
   ✅ Build complete!
   Server is running on port 5000
   ```

4. **Attendez le message** : `Your service is live 🎉`

5. **Notez l'URL** : `https://kplonwe-api.onrender.com`

---

## 🎨 ÉTAPE 4 : PRÉPARER LE FRONTEND

### 4.1 - Mettre à jour votre repo frontend

Dans votre repo GitHub `kplonwe-app`, ajoutez ces fichiers :

#### Fichier 1 : `vercel.json` (à la racine)

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

#### Fichier 2 : `.env.production` (à la racine)

```bash
VITE_API_URL=https://kplonwe-api.onrender.com/api/v1
VITE_APP_NAME=KPLONWE
```

**⚠️ IMPORTANT** : Remplacez `kplonwe-api.onrender.com` par votre VRAIE URL Render !

### 4.2 - Vérifier src/lib/api.ts

Ouvrez `src/lib/api.ts` et vérifiez :

```typescript
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL,
  // ...
});
```

### 4.3 - Push vers GitHub

```bash
git add .
git commit -m "🚀 Ready for Vercel deployment"
git push origin main
```

---

## 🌐 ÉTAPE 5 : DÉPLOYER SUR VERCEL

### 5.1 - Aller sur Vercel

1. Allez sur https://vercel.com/login
2. Connectez-vous avec GitHub

### 5.2 - Importer le projet

1. Cliquez sur **"Add New..."** → **"Project"**
2. Cherchez et sélectionnez **`kplonwe-app`**
3. Cliquez sur **"Import"**

### 5.3 - Configuration

Vercel va auto-détecter Vite. Vérifiez :

- **Framework Preset** : `Vite`
- **Root Directory** : (laisser vide)
- **Build Command** : `npm run build`
- **Output Directory** : `dist`

### 5.4 - Variables d'environnement

Cliquez sur **"Environment Variables"**

Ajoutez :

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://kplonwe-api.onrender.com/api/v1` |
| `VITE_APP_NAME` | `KPLONWE` |

**⚠️ Utilisez votre vraie URL Render !**

### 5.5 - Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes
3. **Notez l'URL** : `https://kplonwe-xxxxx.vercel.app`

---

## 🔗 ÉTAPE 6 : CONNECTER FRONTEND ET BACKEND

### 6.1 - Mettre à jour le CORS

1. **Retournez sur Render**
2. Allez dans votre service **`kplonwe-api`**
3. Cliquez sur **"Environment"**
4. **Modifiez** ces 2 variables :

| Clé | Nouvelle Valeur |
|-----|-----------------|
| `FRONTEND_URL` | `https://kplonwe-xxxxx.vercel.app` |
| `CORS_ORIGIN` | `https://kplonwe-xxxxx.vercel.app` |

⚠️ **Utilisez votre VRAIE URL Vercel !**

5. Cliquez sur **"Save Changes"**
6. Le service va **redémarrer automatiquement**

---

## 👨‍💼 ÉTAPE 7 : CRÉER L'ADMINISTRATEUR

### 7.1 - Ouvrir le Shell Render

1. Sur Render, dans votre service `kplonwe-api`
2. Cliquez sur **"Shell"** en haut à droite
3. Un terminal va s'ouvrir

### 7.2 - Créer l'admin

Dans le terminal, tapez :

```bash
npm run create-admin
```

Ou si ça ne marche pas :

```bash
node scripts/create-admin.js
```

### 7.3 - Notez les identifiants

Vous verrez quelque chose comme :
```
✅ Administrateur créé avec succès !
Email: admin@kplonwe.com
Password: ChangeThisPassword123!
```

**NOTEZ CES IDENTIFIANTS !**

---

## ✅ ÉTAPE 8 : TESTER L'APPLICATION

### Test 1 : Backend fonctionne

Ouvrez votre navigateur :
```
https://kplonwe-api.onrender.com/health
```

Vous devriez voir :
```json
{"status":"ok"}
```

### Test 2 : Frontend fonctionne

1. Ouvrez : `https://kplonwe-xxxxx.vercel.app`
2. Vous devriez voir la page d'accueil KPLONWE

### Test 3 : Connexion admin

1. Cliquez sur **"Se connecter"**
2. Utilisez :
   - **Email** : `admin@kplonwe.com`
   - **Password** : (celui que vous avez noté)

3. Vous devriez arriver sur le dashboard admin ! 🎉

### Test 4 : Créer un compte

1. Déconnectez-vous
2. Cliquez sur **"S'inscrire"**
3. Créez un compte enseignant de test
4. Reconnectez-vous en admin
5. Allez dans **"Professeurs"**
6. Vous devriez voir le professeur que vous venez de créer !

---

## 🐛 DÉPANNAGE

### Problème : "Cannot connect to database"

**Solution** :
1. Vérifiez que la DB Render est **"Available"**
2. Vérifiez que `DATABASE_URL` dans les variables d'environnement est correcte
3. Render → Service → **"Manual Deploy"** → **"Clear build cache & deploy"**

### Problème : "CORS error" dans la console

**Solution** :
1. Vérifiez que `CORS_ORIGIN` contient l'URL Vercel **EXACTE**
2. **Pas de `/` à la fin !**
3. Render → Environment → Modifiez → Save (le service redémarre)

### Problème : "401 Unauthorized"

**Solution** :
1. Déconnectez-vous
2. Reconnectez-vous
3. Si ça persiste, vérifiez que `JWT_SECRET` n'a pas changé

### Problème : Le frontend ne charge pas

**Solution** :
1. Vercel → Deployments → Dernier déploiement → **"View Build Logs"**
2. Cherchez les erreurs
3. Vérifiez que `VITE_API_URL` est correct

---

## 🎉 FÉLICITATIONS !

Votre application est **DÉPLOYÉE** ! 🚀

### Vos URLs :
- **Frontend** : `https://kplonwe-xxxxx.vercel.app`
- **Backend** : `https://kplonwe-api.onrender.com`

### Prochaines étapes :
1. Changez le mot de passe admin après la première connexion
2. Configurez un domaine personnalisé (optionnel)
3. Activez Stripe en mode production
4. Invitez d'autres admins si besoin

---

## 📝 NOTES IMPORTANTES

### Render Free Tier :
- **750 heures/mois gratuites**
- Le service s'endort après **15 minutes d'inactivité**
- Premier chargement peut prendre **30 secondes** (le temps de réveiller)
- Pour éviter ça : upgrade vers le plan payant ($7/mois)

### Vercel Free Tier :
- **100 GB de bande passante/mois**
- **Déploiements illimités**
- Parfait pour commencer !

---

**Bon déploiement ! 💪**
