# 🧪 GUIDE DE TEST - BACKEND SÉCURISÉ

Ce guide vous permet de tester TOUTES les fonctionnalités critiques du backend, en particulier les corrections de sécurité.

---

## 📋 PRÉREQUIS

1. **Backend démarré:**
   ```bash
   npm run dev
   ```

2. **Base de données initialisée:**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. **Variables d'environnement configurées:**
   - `PLATFORM_WALLET_ID` (obtenu après seed)
   - Clés API providers (pour tests réels)

4. **Outils:**
   - Postman ou Insomnia
   - Stripe CLI (pour tester webhooks Stripe)
   - ngrok (pour exposer localhost aux webhooks)

---

## 🎯 TESTS OBLIGATOIRES

### TEST 1: Authentification

#### 1.1 Créer un compte parent
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "parent@test.com",
  "password": "Test123!@#",
  "role": "PARENT",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+22990123456"
}
```

**Attendu:**
- ✅ Status 201
- ✅ `accessToken` et `refreshToken` retournés
- ✅ Wallet créé automatiquement
- ✅ Profil parent créé

#### 1.2 Créer un compte enseignant
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "teacher@test.com",
  "password": "Teacher123!@#",
  "role": "TEACHER",
  "firstName": "Marie",
  "lastName": "Martin",
  "phone": "+22990654321"
}
```

**Attendu:**
- ✅ Status 201
- ✅ `teacherProfile` créé avec `validationStatus: PENDING`

#### 1.3 Connexion
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "parent@test.com",
  "password": "Test123!@#"
}
```

**Copier le token retourné pour les tests suivants.**

---

### TEST 2: Validation Enseignant (Admin)

#### 2.1 Connexion admin
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@educonnect.bj",
  "password": "AdminSecure@2025"
}
```

#### 2.2 Voir enseignants en attente
```bash
GET http://localhost:5000/api/v1/admin/teachers/pending
Authorization: Bearer {ADMIN_TOKEN}
```

**Copier l'ID du teacherProfile.**

#### 2.3 Valider l'enseignant
```bash
PUT http://localhost:5000/api/v1/admin/teachers/{TEACHER_ID}/validate
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "comment": "Profil validé après vérification"
}
```

**Attendu:**
- ✅ Status 200
- ✅ `validationStatus` passe à `VERIFIED`
- ✅ Notification envoyée à l'enseignant

---

### TEST 3: Recharge Wallet (CRITIQUE)

#### 3.1 Initier une recharge Stripe
```bash
POST http://localhost:5000/api/v1/payment/recharge
Authorization: Bearer {PARENT_TOKEN}
Content-Type: application/json

{
  "amount": 10000,
  "method": "CARD_STRIPE"
}
```

**Attendu:**
- ✅ Status 200
- ✅ `reference` généré (ex: RECH-xxx-xxx)
- ✅ `clientSecret` retourné (pour Stripe.js)
- ✅ Transaction créée avec status `PENDING`
- ✅ Montant converti en EUR (10000 XOF ≈ 15.25 EUR)

**Note:** Le montant est validé côté serveur. Essayer avec 0, -100, ou 99999999 → erreur 400.

#### 3.2 Simuler paiement Stripe (avec Stripe CLI)

**Installation Stripe CLI:**
```bash
# Mac
brew install stripe/stripe-cli/stripe

# Linux
wget -qO- https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz | tar -xz

# Login
stripe login
```

**Forward webhooks vers localhost:**
```bash
stripe listen --forward-to http://localhost:5000/api/v1/payment/webhook/stripe
```

**Copier le webhook secret et l'ajouter dans .env:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

**Trigger un paiement réussi:**
```bash
stripe trigger payment_intent.succeeded
```

**Attendu:**
- ✅ Webhook reçu et vérifié
- ✅ Transaction passe à `COMPLETED`
- ✅ Wallet crédité de 10000 FCFA
- ✅ Transaction verrouillée (`isLocked: true`)
- ✅ Notification créée

#### 3.3 Vérifier le wallet
```bash
GET http://localhost:5000/api/v1/wallet
Authorization: Bearer {PARENT_TOKEN}
```

**Attendu:**
- ✅ `balance: 10000`

---

### TEST 4: Protection Signature Webhook (CRITIQUE)

#### 4.1 Webhook Stripe avec signature invalide

**Créer un webhook manual:**
```bash
POST http://localhost:5000/api/v1/payment/webhook/stripe
stripe-signature: fake-signature-123
Content-Type: application/json

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_fake",
      "metadata": {
        "reference": "RECH-xxx"
      }
    }
  }
}
```

**Attendu:**
- ✅ Status 401
- ✅ Message: "Signature invalide"
- ✅ Transaction NON complétée
- ✅ Log d'erreur dans `logs/error.log`

#### 4.2 Webhook MoMo sans signature
```bash
POST http://localhost:5000/api/v1/payment/webhook/momo
Content-Type: application/json

{
  "externalId": "RECH-xxx",
  "status": "SUCCESSFUL",
  "amount": "10000"
}
```

**Attendu:**
- ✅ Status 401
- ✅ Webhook rejeté
- ✅ Transaction NON complétée

**Résultat:** ✅ Protection contre webhooks fake fonctionne.

---

### TEST 5: Protection Double Paiement (CRITIQUE)

#### 5.1 Envoyer le même webhook 2 fois

**Première fois:**
```bash
stripe trigger payment_intent.succeeded
```
→ Transaction complétée, wallet crédité

**Deuxième fois (immédiatement après):**
```bash
stripe trigger payment_intent.succeeded
# (Même payment_intent)
```

**Attendu:**
- ✅ Deuxième webhook ignoré
- ✅ Message: "Déjà traité"
- ✅ Wallet PAS crédité une 2ème fois
- ✅ Log: "Transaction xxx déjà traitée - idempotence OK"

**Résultat:** ✅ Protection double paiement fonctionne.

---

### TEST 6: Paiement Enseignant avec Commission (CRITIQUE)

#### 6.1 Payer un enseignant
```bash
POST http://localhost:5000/api/v1/payment/pay-teacher
Authorization: Bearer {PARENT_TOKEN}
Content-Type: application/json

{
  "teacherId": "{TEACHER_PROFILE_ID}",
  "amount": 5000,
  "description": "Cours de mathématiques"
}
```

**Attendu:**
- ✅ Status 200
- ✅ Transaction créée
- ✅ Parent débité: -5000 FCFA
- ✅ Enseignant crédité: +4900 FCFA (98%)
- ✅ Plateforme créditée: +100 FCFA (2%)
- ✅ 2 transactions distinctes créées:
  - `PAY-xxx` (PAYMENT)
  - `COMM-xxx` (COMMISSION)

#### 6.2 Vérifier wallet parent
```bash
GET http://localhost:5000/api/v1/wallet
Authorization: Bearer {PARENT_TOKEN}
```

**Attendu:**
- ✅ Balance = 10000 - 5000 = 5000 FCFA

#### 6.3 Vérifier wallet enseignant
```bash
GET http://localhost:5000/api/v1/wallet
Authorization: Bearer {TEACHER_TOKEN}
```

**Attendu:**
- ✅ Balance = 4900 FCFA

#### 6.4 Vérifier wallet plateforme (Admin)
```bash
GET http://localhost:5000/api/v1/wallet
Authorization: Bearer {ADMIN_TOKEN}
```

**Attendu:**
- ✅ Balance augmentée de 100 FCFA

#### 6.5 Vérifier transactions séparées
```bash
GET http://localhost:5000/api/v1/wallet/transactions
Authorization: Bearer {PARENT_TOKEN}
```

**Attendu:**
- ✅ 2 transactions visibles:
  - Une `PAYMENT` de 5000 → enseignant
  - Une `COMMISSION` de 100 → plateforme

**Résultat:** ✅ Commission traçable et séparée.

---

### TEST 7: Solde Insuffisant

#### 7.1 Tenter paiement > solde
```bash
POST http://localhost:5000/api/v1/payment/pay-teacher
Authorization: Bearer {PARENT_TOKEN}
Content-Type: application/json

{
  "teacherId": "{TEACHER_PROFILE_ID}",
  "amount": 999999,
  "description": "Test"
}
```

**Attendu:**
- ✅ Status 400
- ✅ Message: "Solde insuffisant"
- ✅ Aucune transaction créée
- ✅ Aucun wallet modifié

**Résultat:** ✅ Validation solde fonctionne.

---

### TEST 8: Abonnements

#### 8.1 Recharger wallet enseignant
```bash
POST http://localhost:5000/api/v1/payment/recharge
Authorization: Bearer {TEACHER_TOKEN}
Content-Type: application/json

{
  "amount": 5000,
  "method": "CARD_STRIPE"
}
```

→ Suivre le flow Stripe, valider le paiement.

#### 8.2 S'abonner Premium
```bash
POST http://localhost:5000/api/v1/subscription/premium
Authorization: Bearer {TEACHER_TOKEN}
Content-Type: application/json

{
  "teacherId": "{TEACHER_PROFILE_ID}"
}
```

**Attendu:**
- ✅ Status 201
- ✅ Wallet débité: -5000 FCFA
- ✅ Wallet plateforme crédité: +5000 FCFA
- ✅ Transaction `SUBSCRIPTION` créée
- ✅ Abonnement créé avec `endDate` = +30 jours
- ✅ `isPremium: true` sur profil
- ✅ Notification envoyée

#### 8.3 Vérifier abonnement actif
```bash
GET http://localhost:5000/api/v1/subscription/active/TEACHER_PREMIUM
Authorization: Bearer {TEACHER_TOKEN}
```

**Attendu:**
- ✅ `{ isActive: true }`

#### 8.4 Tester expiration (cron job)

**Méthode 1: Modifier manuellement la date dans la DB**
```sql
UPDATE Subscription
SET endDate = datetime('now', '-1 day')
WHERE type = 'TEACHER_PREMIUM';
```

**Méthode 2: Appeler le cron manuellement**
```bash
# Créer un endpoint de test (dev only)
GET http://localhost:5000/api/v1/admin/cron/subscriptions/run
Authorization: Bearer {ADMIN_TOKEN}
```

**Attendu:**
- ✅ Abonnement désactivé (`isActive: false`)
- ✅ `isPremium: false` sur profil
- ✅ Notification d'expiration envoyée

---

### TEST 9: Atomicité Transaction (CRITIQUE)

#### 9.1 Simuler échec en cours de transaction

**Créer un endpoint de test qui échoue:**
```javascript
// test.controller.js
export const testTransactionRollback = asyncHandler(async (req, res) => {
  await prisma.$transaction(async (tx) => {
    // Débiter
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: { decrement: 1000 } }
    });
    
    // Créditer
    await tx.wallet.update({
      where: { id: otherWalletId },
      data: { balance: { increment: 1000 } }
    });
    
    // ÉCHEC VOLONTAIRE
    throw new Error('TEST ROLLBACK');
  });
});
```

**Appeler:**
```bash
POST http://localhost:5000/api/v1/test/rollback
Authorization: Bearer {TOKEN}
```

**Attendu:**
- ✅ Status 500
- ✅ Aucun wallet modifié (rollback automatique)
- ✅ Balances inchangées

**Résultat:** ✅ Atomicité garantie.

---

### TEST 10: Logs & Audit

#### 10.1 Vérifier les logs
```bash
tail -f logs/combined.log
```

**Attendu:**
- ✅ Tous les paiements loggés
- ✅ Toutes les tentatives de fraude loggées
- ✅ Format structuré (timestamp, level, message)

#### 10.2 Logs d'erreur
```bash
tail -f logs/error.log
```

**Attendu:**
- ✅ Webhooks invalides loggés
- ✅ Stack traces disponibles
- ✅ Contexte complet

---

## 📊 CHECKLIST DE TEST

| Test | Description | Statut |
|------|-------------|--------|
| 1 | Authentification fonctionne | ☐ |
| 2 | Validation enseignant fonctionne | ☐ |
| 3 | Recharge Stripe fonctionne | ☐ |
| 4 | Webhook signature vérifiée | ☐ |
| 5 | Double paiement bloqué | ☐ |
| 6 | Commission 2% correcte | ☐ |
| 7 | Solde insuffisant bloqué | ☐ |
| 8 | Abonnements fonctionnent | ☐ |
| 9 | Cron expiration fonctionne | ☐ |
| 10 | Atomicité garantie | ☐ |
| 11 | Logs complets | ☐ |

---

## 🔧 OUTILS DE TEST

### Postman Collection

Importer cette collection pour tester automatiquement:

```json
{
  "info": {
    "name": "EduConnect API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register Parent",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"parent@test.com\",\n  \"password\": \"Test123!@#\",\n  \"role\": \"PARENT\",\n  \"firstName\": \"Jean\",\n  \"lastName\": \"Dupont\",\n  \"phone\": \"+22990123456\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api/v1"
    }
  ]
}
```

### Stripe CLI Commands

```bash
# Écouter les webhooks
stripe listen --forward-to http://localhost:5000/api/v1/payment/webhook/stripe

# Trigger events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded

# Créer un Payment Intent de test
stripe payment_intents create \
  --amount=1525 \
  --currency=eur \
  --metadata[reference]=RECH-test-123
```

### ngrok (pour webhooks depuis MoMo/Moov)

```bash
# Installer ngrok
brew install ngrok  # Mac
# ou télécharger depuis https://ngrok.com

# Exposer localhost
ngrok http 5000

# URL générée (ex: https://abc123.ngrok.io)
# Configurer dans les dashboards MoMo/Moov:
# https://abc123.ngrok.io/api/v1/payment/webhook/momo
# https://abc123.ngrok.io/api/v1/payment/webhook/moov
```

---

## 🚨 TESTS DE SÉCURITÉ

### Test Injection SQL
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin' OR '1'='1",
  "password": "anything"
}
```

**Attendu:** ✅ Échec connexion (Prisma protège contre SQL injection)

### Test XSS
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "<script>alert('XSS')</script>",
  "email": "test@test.com",
  "password": "Test123!@#",
  "role": "STUDENT"
}
```

**Attendu:** ✅ Script échappé/sanitizé

---

## ✅ VALIDATION FINALE

Tous les tests passés = Backend production-ready ✅

**Note:** Avant déploiement production, exécuter TOUS ces tests avec les vraies clés API.
