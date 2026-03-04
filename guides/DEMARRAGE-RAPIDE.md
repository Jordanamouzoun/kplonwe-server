# ⚡ DÉMARRAGE RAPIDE - 5 MINUTES

## 🎯 TU ES PRÊT ? ALLONS-Y !

### ✅ ÉTAPE 1 : BACKEND SUR RENDER (15 min)

#### 1.1 - Ajoute les fichiers au repo backend

```bash
# Dans ton repo kplonwe-server local
cp backend-files/build.sh .
cp backend-files/schema.prisma.postgresql prisma/schema.prisma  
cp backend-files/.env.example .

chmod +x build.sh

git add .
git commit -m "🚀 Ready for deployment"
git push
```

#### 1.2 - Crée la base de données

🌐 https://dashboard.render.com → New + → PostgreSQL

- Name: `kplonwe-db`
- Region: Frankfurt
- Plan: **Free**

**📋 COPIE L'URL** affichée (tu en auras besoin !)

#### 1.3 - Crée le service backend

New + → Web Service → Connecte `kplonwe-server`

**Config** :
- Build: `./build.sh`
- Start: `npm start`

**Variables** (clic "Advanced") :
```
DATABASE_URL = [colle l'URL copiée]
JWT_SECRET = [génère avec : node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
JWT_REFRESH_SECRET = [génère un autre]
FRONTEND_URL = https://kplonwe.vercel.app
CORS_ORIGIN = https://kplonwe.vercel.app
PORT = 5000
NODE_ENV = production
```

Deploy ! ⏳ Attends 5 minutes

**📋 NOTE TON URL** : `https://kplonwe-api.onrender.com`

---

### ✅ ÉTAPE 2 : FRONTEND SUR VERCEL (10 min)

#### 2.1 - Ajoute les fichiers au repo frontend

```bash
# Dans ton repo kplonwe-app local
cp frontend-files/vercel.json .
cp frontend-files/.env.production .

# ⚠️ Modifie .env.production avec ta vraie URL Render !
nano .env.production
# Change https://kplonwe-api.onrender.com par ton URL

git add .
git commit -m "🚀 Ready for deployment"
git push
```

#### 2.2 - Déploie sur Vercel

🌐 https://vercel.com → New Project → Import `kplonwe-app`

**Variables** :
```
VITE_API_URL = https://kplonwe-api.onrender.com/api/v1
VITE_APP_NAME = KPLONWE
```

Deploy ! ⏳ Attends 3 minutes

**📋 NOTE TON URL** : `https://kplonwe-xxxxx.vercel.app`

---

### ✅ ÉTAPE 3 : CONNECTE-LES (2 min)

Retour sur Render → Service `kplonwe-api` → Environment

**Modifie** :
```
FRONTEND_URL = https://kplonwe-xxxxx.vercel.app  [ton URL Vercel]
CORS_ORIGIN = https://kplonwe-xxxxx.vercel.app   [ton URL Vercel]
```

Save → Le service redémarre automatiquement

---

### ✅ ÉTAPE 4 : CRÉE L'ADMIN (3 min)

Render → Service → Shell (en haut à droite)

```bash
npm run create-admin
```

**📋 NOTE** l'email et le mot de passe affichés !

---

### ✅ ÉTAPE 5 : TESTE ! (2 min)

1. **Backend** : https://kplonwe-api.onrender.com/health
   → Tu dois voir `{"status":"ok"}`

2. **Frontend** : https://kplonwe-xxxxx.vercel.app
   → Tu dois voir ton site

3. **Login admin** : Connecte-toi avec les identifiants notés
   → Tu dois arriver sur le dashboard

---

## 🎉 C'EST FAIT !

Ton app est **EN PRODUCTION** ! 🚀

**Temps total** : ~30 minutes

**Coût** : 0€ (plans gratuits)

---

## 🐛 UN PROBLÈME ?

**Backend ne démarre pas** :
→ Logs Render → Cherche l'erreur

**CORS error** :
→ Vérifie que CORS_ORIGIN = URL Vercel exacte (pas de `/` final)

**Frontend error** :
→ F12 → Console → Vois l'erreur

**Besoin d'aide ?** → Consulte `DEPLOIEMENT-SIMPLE.md` pour plus de détails

---

**GO ! 💪**
