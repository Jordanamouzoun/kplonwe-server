# ⚡ QUICKSTART - 5 MINUTES

Démarrage ultra-rapide du backend EduConnect.

## 🚀 Installation en 5 minutes

```bash
# 1. Extraire le ZIP
unzip educonnect-backend-complete.zip
cd server

# 2. Installer les dépendances
npm install

# 3. Configurer
cp .env.example .env
nano .env  # Éditer avec tes clés

# 4. Base de données
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 5. Démarrer
npm run dev
```

**✅ Le serveur tourne sur http://localhost:5000**

---

## 🔑 Compte Admin par défaut

Après le seed, tu as un compte admin créé :

```
Email: admin@educonnect.bj
Password: AdminSecure@2025
```

**⚠️ CHANGE LE MOT DE PASSE EN PRODUCTION !**

---

## 🧪 Test Rapide

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Connexion Admin
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@educonnect.bj","password":"AdminSecure@2025"}'
```

Copie le `accessToken` de la réponse.

### 3. Stats Admin
```bash
curl http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer TON_TOKEN_ICI"
```

---

## 📝 .env Minimal pour démarrer

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT (CHANGE CES CLÉS!)
JWT_SECRET=change-cette-cle-en-production-minimum-32-caracteres
JWT_REFRESH_SECRET=change-aussi-cette-cle-differente-de-la-precedente

# Server
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Platform (Tu l'obtiens après le seed)
PLATFORM_WALLET_ID=sera-affiche-apres-seed
PLATFORM_COMMISSION_RATE=0.02

# Pour les paiements, ajoute tes clés API quand tu es prêt
# MOMO_API_KEY=...
# MOOV_API_KEY=...
# STRIPE_SECRET_KEY=...
```

---

## 🎯 Prochaines étapes

1. **Tester l'inscription**
   - Créer un compte TEACHER
   - Créer un compte PARENT
   - Créer un compte STUDENT

2. **Tester le wallet**
   - Consulter son wallet
   - Voir l'historique (vide au début)

3. **Configurer les paiements**
   - Obtenir clés API MoMo Pay
   - Obtenir clés API Moov Money
   - Obtenir clés API Stripe
   - Configurer les webhooks

4. **Brancher le frontend**
   - Les routes API sont prêtes
   - Voir README.md pour la doc complète

---

## 💡 Commandes Utiles

```bash
# Développement avec auto-reload
npm run dev

# Production
npm start

# Prisma Studio (interface graphique DB)
npm run prisma:studio

# Voir les logs
tail -f logs/combined.log

# Reset DB (⚠️ efface tout)
npm run prisma:reset
```

---

## 🆘 Problèmes ?

### "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### "PLATFORM_WALLET_ID is not defined"
```bash
npm run prisma:seed
# Copie l'ID affiché et ajoute-le dans .env
```

### Port déjà utilisé
```bash
# Change le port dans .env
PORT=5001
```

---

## 📚 Documentation Complète

Voir **README.md** pour :
- Documentation API complète
- Configuration des paiements
- Déploiement production
- Architecture détaillée
- Sécurité

---

**Ready to go! 🎉**
