# 🚀 KPLONWE - PACKAGE DE DÉPLOIEMENT

Ce package contient TOUT ce dont tu as besoin pour déployer KPLONWE en production.

## 📦 CONTENU

```
deployment-package/
├── backend-files/          → Fichiers à ajouter au repo backend
│   ├── schema.prisma.postgresql
│   ├── build.sh
│   └── .env.example
│
├── frontend-files/         → Fichiers à ajouter au repo frontend
│   ├── vercel.json
│   └── .env.production
│
└── guides/                 → Guides de déploiement
    ├── DEMARRAGE-RAPIDE.md        ← COMMENCE ICI ! ⚡
    ├── DEPLOIEMENT-SIMPLE.md      ← Guide complet pas-à-pas
    ├── CHECKLIST.md               ← Checklist rapide
    └── GUIDE-DEPLOIEMENT-COMPLET.md ← Documentation détaillée
```

## 🎯 PAR OÙ COMMENCER ?

### ⚡ Option 1 : Démarrage Rapide (RECOMMANDÉ)
📖 `guides/DEMARRAGE-RAPIDE.md`
→ Guide ultra-concis, 5 étapes
→ 30 minutes chrono

### 📚 Option 2 : Guide Simple  
📖 `guides/DEPLOIEMENT-SIMPLE.md`
→ Explications détaillées de chaque étape
→ Pour bien comprendre ce que tu fais

### ✅ Option 3 : Checklist
📋 `guides/CHECKLIST.md`
→ Si tu connais déjà Render/Vercel
→ Coche juste les cases

### 🔧 Option 4 : Guide Complet
📚 `guides/GUIDE-DEPLOIEMENT-COMPLET.md`
→ Documentation exhaustive
→ Troubleshooting avancé

## 🚀 VUE D'ENSEMBLE

### Ton backend sur **Render**
```
PostgreSQL Database (gratuit)
    ↓
Node.js API (gratuit, 750h/mois)
    ↓
URL: https://kplonwe-api.onrender.com
```

### Ton frontend sur **Vercel**
```
React + Vite (gratuit, illimité)
    ↓
URL: https://kplonwe-xxxxx.vercel.app
```

### Connexion automatique
```
CORS configuré ✓
Variables d'env prêtes ✓
HTTPS activé ✓
```

## ⚡ RÉSUMÉ DES 5 ÉTAPES

```
1. BACKEND
   → Copie les fichiers dans ton repo
   → Crée PostgreSQL sur Render
   → Déploie le service

2. FRONTEND
   → Copie les fichiers dans ton repo
   → Déploie sur Vercel

3. CONNEXION
   → Update CORS_ORIGIN avec l'URL Vercel

4. ADMIN
   → Crée l'admin via Shell Render

5. TEST
   → Vérifie que tout marche
```

**Temps total** : 30 minutes
**Coût** : 0€

## ⚠️ POINTS IMPORTANTS

1. **PostgreSQL obligatoire** : SQLite ne marche PAS sur Render
2. **URLs exactes** : Copie-colle les URLs sans erreur
3. **Pas de `/` final** : https://ton-app.vercel.app (PAS de `/` à la fin)
4. **Secrets forts** : Génère des JWT secrets de 64+ caractères

## 🎉 APRÈS LE DÉPLOIEMENT

Une fois que tout marche :
- ✅ Change le mot de passe admin
- ✅ Configure un domaine personnalisé (optionnel)
- ✅ Active Stripe en production
- ✅ Invite d'autres admins

## 📞 BESOIN D'AIDE ?

Problème ? → Consulte la section "Dépannage" de chaque guide

Les logs sont tes amis :
- **Render** : Dashboard → Service → Logs
- **Vercel** : Dashboard → Deployments → View Logs
- **Browser** : F12 → Console

**Bon déploiement ! 🚀**
