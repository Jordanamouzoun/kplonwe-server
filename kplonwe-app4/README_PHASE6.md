# 📱 PHASE 6 - MESSAGERIE & NOTIFICATIONS

**Version:** 6.0  
**Date:** 08 février 2026  
**Priorité:** Accessibilité WCAG 2.1 AA+ pour utilisateurs aveugles

---

## 🎯 OBJECTIF

Messagerie interne complète + système de notifications, entièrement accessible aux utilisateurs aveugles (lecteurs d'écran NVDA, VoiceOver).

---

## 👥 RÈGLES MÉTIER - MESSAGERIE

### ✅ Conversations Autorisées

| Rôle 1 | ↔ | Rôle 2 |
|--------|---|--------|
| Parent | ✓ | Professeur |
| Professeur | ✓ | Élève |
| École | ✓ | Professeur |

### ❌ Conversations Interdites

- Élève ↔ Élève
- Parent ↔ Parent  
- Élève ↔ École
- Parent ↔ École

### 📋 Règles Supplémentaires

1. **Parents** : Voient toutes les conversations de leurs enfants
2. **Élèves** : Ne peuvent pas supprimer une conversation
3. **Parents** : Peuvent bloquer/débloquer un professeur
4. **Professeurs** : Ne peuvent pas initier une discussion avec un parent sans lien existant (parent doit avoir payé le professeur)

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Backend - Modèles Prisma

#### Conversation
```prisma
model Conversation {
  id               String   @id @default(uuid())
  participant1Id   String
  participant1Role String   // PARENT, TEACHER, STUDENT, SCHOOL
  participant2Id   String
  participant2Role String
  
  lastMessageAt    DateTime @default(now())
  isBlocked        Boolean  @default(false)
  blockedBy        String?
  
  messages         Message[]
}
```

#### Message
```prisma
model Message {
  id             String   @id
  conversationId String
  senderId       String
  senderRole     String
  receiverId     String
  receiverRole   String
  content        String
  readAt         DateTime?
  createdAt      DateTime
}
```

#### NotificationModel
```prisma
model NotificationModel {
  id        String   @id
  userId    String
  type      String   // NEW_MESSAGE, TEACHER_LINKED, PAYMENT_RECEIVED
  title     String
  message   String
  data      String?  // JSON
  isRead    Boolean  @default(false)
  createdAt DateTime
}
```

### Backend - Endpoints API

#### Messagerie
- `POST /api/v1/messages/conversations` - Créer/récupérer conversation
- `GET /api/v1/messages/conversations` - Liste conversations
- `GET /api/v1/messages/conversations/:id` - Messages d'une conversation
- `POST /api/v1/messages/conversations/:id/messages` - Envoyer message
- `PUT /api/v1/messages/conversations/:id/read` - Marquer comme lu

#### Notifications
- `GET /api/v1/notifications` - Liste notifications
- `PUT /api/v1/notifications/:id/read` - Marquer notification lue
- `PUT /api/v1/notifications/read-all` - Tout marquer lu

### Frontend - Architecture

#### Contexts
- **NotificationContext** : Gestion globale des notifications
  - État : `notifications`, `unreadCount`
  - Actions : `markAsRead`, `markAllAsRead`, `fetchNotifications`
  - Auto-refresh : Toutes les 30 secondes

#### Pages
- `/messages` - Liste des conversations
- `/messages/:conversationId` - Vue conversation avec messages

#### Composants
- `NotificationBadge` - Badge dans header avec dropdown
- `MessagesListPage` - Liste conversations avec recherche
- `ConversationPage` - Chat temps réel

---

## ♿ ACCESSIBILITÉ (WCAG 2.1 AA+)

### 🎙️ Lecteurs d'Écran

#### Annonces Vocales
```tsx
// ✅ Live region pour nouveaux messages
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {liveRegionMessage}
</div>

// Annonce: "Nouveau message de Marie : Bonjour"
```

#### Role Log pour Messages
```tsx
// ✅ Historique des messages
<div role="log" aria-label="Fil de la conversation">
  {messages.map(message => (
    <article aria-label={`Message de ${sender} envoyé ${time}`}>
      {message.content}
    </article>
  ))}
</div>
```

#### Labels Explicites
```tsx
// ✅ TOUS les éléments interactifs ont aria-label
<button aria-label="Envoyer le message">
<Link aria-label="Conversation avec Marie Konaté, 2 messages non lus">
<textarea aria-label="Tapez votre message. Entrée pour envoyer, Shift+Entrée pour nouvelle ligne">
```

### ⌨️ Navigation Clavier

#### Focus Automatique
1. **Ouverture conversation** → Focus sur input message
2. **Envoi message** → Focus retourne sur input
3. **Réception message** → Annonce vocale + scroll auto

#### Raccourcis
- `Tab` : Navigation entre éléments
- `Entrée` : Envoyer message
- `Shift+Entrée` : Nouvelle ligne
- `Échap` : Fermer modals/dropdowns

#### Focus Visible
```css
/* ✅ Focus visible partout */
.focus\:ring-2 {
  outline: 3px solid var(--primary-600);
  outline-offset: 3px;
}
```

### 📢 Notifications Accessibles

#### Badge Notifications
```tsx
// ✅ Compte annoncé
<button aria-label="Notifications, 3 non lues">
  <Bell />
  <span aria-label="3 notifications non lues">3</span>
</button>
```

#### Nouveaux Messages
```tsx
// ✅ Annonce automatique
setLiveRegionMessage(`Nouveau message de ${sender} : ${content}`);
```

#### États Visuels + Vocaux
- Badge rouge avec nombre
- Fond bleu sur non lus
- Texte en gras sur non lus
- Annonce "X messages non lus"

---

## 🧪 TESTS ACCESSIBILITÉ

### Avec NVDA/VoiceOver

1. **Navigation liste conversations**
   - ✅ Chaque conversation annoncée avec nom + messages non lus
   - ✅ "Conversation avec Marie Konaté, 2 messages non lus"

2. **Envoi message**
   - ✅ Focus automatique sur input
   - ✅ Raccourci Entrée fonctionne
   - ✅ Annonce "Message envoyé"

3. **Réception message**
   - ✅ Annonce "Nouveau message de Marie : Bonjour"
   - ✅ Scroll automatique vers nouveau message

4. **Notifications**
   - ✅ Badge annoncé "3 notifications non lues"
   - ✅ Dropdown navigable au clavier
   - ✅ Marquer lu accessible

### Avec Clavier Uniquement

1. **Tab** : Parcourt tous les éléments
2. **Entrée/Espace** : Active boutons/liens
3. **Échap** : Ferme modals
4. **Pas de pièges clavier** : On peut toujours sortir

---

## 📊 TYPES DE NOTIFICATIONS

| Type | Titre | Message | Déclencheur |
|------|-------|---------|-------------|
| `NEW_MESSAGE` | Nouveau message | `X vous a envoyé un message` | Message reçu |
| `TEACHER_LINKED` | Professeur ajouté | `X est maintenant professeur de votre enfant` | Parent lie professeur |
| `PAYMENT_RECEIVED` | Paiement reçu | `Vous avez reçu X FCFA de Y` | Paiement professeur |

---

## 🚀 INSTALLATION

```bash
# Backend
cd server
npm install
npx prisma generate  # Générer client Prisma avec nouveaux modèles
npx prisma db push   # Créer tables en base
npm run dev

# Frontend
cd educonnect-app
npm install
npm run dev
```

---

## 📝 UTILISATION

### Créer une Conversation

1. Parent/Professeur/École se connecte
2. Va sur `/messages`
3. Clic sur "Nouvelle conversation" (si disponible)
4. Sélectionne destinataire
5. Envoie premier message

**OU** la conversation est créée automatiquement au premier message.

### Envoyer un Message

1. Ouvrir conversation
2. Taper message dans input
3. Appuyer sur `Entrée` ou cliquer "Envoyer"
4. Message envoyé + notification créée pour destinataire

### Recevoir Notification

1. Badge rouge apparaît dans header
2. Annonce vocale (si lecteur d'écran)
3. Clic sur badge → Voir notifications
4. Clic sur notification → Marquer lue

---

## ⚠️ LIMITATIONS CONNUES

1. **Pas de temps réel WebSocket** : Polling toutes les 5 secondes dans conversation
2. **Pas de pièces jointes** : Messages texte uniquement
3. **Pas de formatage** : Texte brut (pas de markdown/HTML)
4. **Pas de groupes** : Conversations 1-to-1 uniquement
5. **Pas d'historique infini** : Derniers messages chargés

---

## 🎨 UX & DESIGN

### Messages d'Erreur

❌ **Mauvais** : "Erreur"  
✅ **Bon** : "Cette conversation est bloquée. Vous ne pouvez pas envoyer de message."

### États Vides

❌ **Mauvais** : Page blanche  
✅ **Bon** : "Aucune conversation. Vos conversations apparaîtront ici."

### Feedback Utilisateur

- ✅ Message envoyé → "Message envoyé" (vocal)
- ✅ Erreur envoi → "Erreur: contenu requis" (vocal + visuel)
- ✅ Nouveau message → "Nouveau message de X" (vocal)

---

## 🔐 SÉCURITÉ

1. **Vérification JWT** : Toutes les routes protégées
2. **Vérification participation** : User doit être dans la conversation
3. **Règles métier appliquées** : Pas de conversation interdite
4. **Sanitization** : Contenu messages échappé
5. **Isolation** : User voit QUE ses conversations

---

## ✅ CHECKLIST VALIDATION

### Backend
- [x] Modèles Prisma créés
- [x] Endpoints messagerie fonctionnels
- [x] Endpoints notifications fonctionnels
- [x] Règles métier appliquées
- [x] Vérifications sécurité

### Frontend
- [x] NotificationContext opérationnel
- [x] Page liste conversations
- [x] Page conversation individuelle
- [x] NotificationBadge dans header
- [x] Routes intégrées
- [x] Recherche conversations

### Accessibilité
- [x] role="log" sur messages
- [x] aria-live="polite" nouveaux messages
- [x] aria-label partout
- [x] Navigation 100% clavier
- [x] Focus géré automatiquement
- [x] Annonces vocales
- [x] Pas de contenu visuel seul

### Tests
- [x] Envoi message
- [x] Réception message
- [x] Marquage lu
- [x] Notifications
- [x] Lecteur écran (NVDA)
- [x] Navigation clavier

---

## 🎯 SCÉNARIOS D'USAGE

### Scénario 1: Parent contacte Professeur

1. Parent se connecte
2. Va sur `/messages`
3. Voit professeurs payés
4. Ouvre conversation avec "Marie Konaté"
5. Envoie : "Bonjour, comment va mon fils?"
6. Professeur reçoit notification
7. Professeur répond : "Il progresse bien!"
8. Parent voit message + notification

### Scénario 2: Professeur à Élève

1. Professeur se connecte
2. Va sur `/messages`
3. Voit liste élèves
4. Ouvre conversation avec "Lucas"
5. Envoie : "N'oublie pas le devoir pour demain"
6. Lucas reçoit notification
7. Parent de Lucas voit AUSSI la conversation (règle métier)

### Scénario 3: Utilisateur Aveugle

1. Active NVDA
2. Tab vers "Messages" dans header
3. Entend "Messages, lien"
4. Entrée
5. Entend "Liste de vos conversations"
6. Tab vers conversation
7. Entend "Conversation avec Marie Konaté, 2 messages non lus"
8. Entrée
9. Entend messages un par un
10. Tab vers input
11. Tape message
12. Entrée
13. Entend "Message envoyé"

---

## 📚 RESSOURCES

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices - Chat](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [VoiceOver Guide](https://www.apple.com/voiceover/)

---

**✅ PHASE 6 COMPLÈTE**

Messagerie accessible + Notifications fonctionnelles.  
Utilisateurs aveugles peuvent communiquer sans voir l'écran.
