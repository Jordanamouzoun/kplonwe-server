# 📚 PHASES 6 & 7 - PROFILS PROFESSEURS & QUIZ D'ÉVALUATION

**Version:** 7.0  
**Date:** 08 février 2026  
**Priorité:** Accessibilité WCAG 2.1 AA+

---

## 🎯 PHASE 6 - PROFILS PROFESSEURS & CONFORMITÉ

### Objectif
Permettre aux professeurs de créer un profil professionnel crédible avec upload de diplômes et système de validation.

### Fonctionnalités Implémentées

#### 👤 Profil Professeur Public
- **Route:** `/teachers/:teacherId`
- **Accessible:** Parents, Écoles, Public
- **Affichage:**
  - Photo de profil
  - Nom complet
  - Statuts: ⏳ Non vérifié | ✅ Conforme | ❌ Refusé
  - Matières enseignées
  - Biographie
  - Expérience (années)
  - Formation
  - Certifications
  - Note moyenne + avis
- **Accessibilité:**
  - `aria-label` sur statut
  - Icônes avec texte alternatif
  - Navigation clavier complète

#### ✏️ Édition Profil (Professeur)
- **Route:** `/teacher/profile/edit`
- **Formulaire accessible:**
  - Bio (textarea)
  - Matières (sélection multiple)
  - Expérience (nombre)
  - Formation (textarea)
  - Certifications (liste dynamique)
- **Validation:**
  - Champs requis annoncés
  - Erreurs vocales avec `aria-live`
  - Focus automatique après sauvegarde

#### 📄 Gestion Diplômes
- **Route:** `/teacher/documents`
- **Actions:**
  - Upload PDF/image
  - Liste documents
  - Téléchargement
  - Suppression
- **Types documents:**
  - DIPLOMA (Diplôme)
  - CERTIFICATE (Certificat)
  - ID_CARD (Pièce d'identité)
  - OTHER (Autre)
- **Statuts:**
  - PENDING (En attente)
  - VERIFIED (Vérifié)
  - REJECTED (Refusé)
- **Accessibilité:**
  - Nom fichier annoncé au lecteur d'écran
  - Statut vocalisé
  - Upload avec feedback vocal immédiat
  - Preview accessible (alt text)

---

## 🎯 PHASE 7 - QUIZ D'ÉVALUATION PROFESSEURS

### Objectif
Permettre aux écoles de créer des quiz d'évaluation pour juger l'éligibilité des professeurs.

⚠️ **Ces quiz NE SONT PAS des quiz pédagogiques pour élèves** mais des tests de sélection pour professeurs.

### Règles Métier

#### 📊 Limites Création Quiz (École)

| Mode | Limite |
|------|--------|
| **Gratuit** | 7 quiz/mois maximum |
| **Premium** | Illimité |

**Comportement:**
- Compteur affiché: "X quiz restants ce mois"
- Si limite atteinte:
  - Bouton "Créer quiz" désactivé
  - Message accessible: *"Limite mensuelle atteinte (7 quiz). Passez en premium pour créer des quiz illimités."*
  - CTA vers premium visible

### Fonctionnalités Implémentées

#### 🏫 CÔTÉ ÉCOLE

##### 1. Création Quiz
- **Route:** `/school/evaluation/create`
- **Formulaire:**
  - Titre (requis)
  - Description
  - Matière
  - Score de passage (%, défaut: 70%)
  - Limite de temps (minutes, optionnel)
- **Types de questions:**
  - QCM (choix multiples)
  - Vrai/Faux
  - Réponses courtes
- **Actions:**
  - Ajouter question
  - Supprimer question
  - Réordonner
  - Prévisualiser
  - Publier
- **Accessibilité:**
  - Chaque question annoncée: "Question 1 sur X"
  - Boutons ajouter/supprimer vocalisés
  - Validation avec `aria-invalid`
  - Messages erreur avec `aria-live="assertive"`

##### 2. Attribution à Professeur
- **Route:** `/school/evaluation/:quizId/assign`
- **Sélection professeur:**
  - Liste professeurs inscrits
  - Filtrage par matière
  - Recherche par nom
- **Notification:**
  - Email au professeur
  - Notification in-app
  - Message: *"Une école vous a attribué un quiz: [Titre]"*

##### 3. Résultats
- **Route:** `/school/evaluation/:quizId/results`
- **Affichage:**
  - Liste professeurs ayant passé le quiz
  - Score global (%)
  - Statut: Réussi / Échoué
  - Date de passage
  - Temps passé
  - Score par question
- **Actions:**
  - Marquer "Conforme" / "Non conforme"
  - Télécharger résultats (CSV)
  - Voir détails réponses

#### 👨‍🏫 CÔTÉ PROFESSEUR

##### 1. Liste Quiz Assignés
- **Route:** `/teacher/evaluations`
- **Affichage:**
  - Quiz en attente
  - Quiz complétés
  - École source
  - Date d'attribution
  - Date limite (si applicable)
  - Score (si complété)
- **Statuts:**
  - 🟡 PENDING (À faire)
  - 🔵 STARTED (En cours)
  - 🟢 COMPLETED - PASSED (Réussi)
  - 🔴 COMPLETED - FAILED (Échoué)

##### 2. Passage Quiz
- **Route:** `/teacher/evaluations/:quizId/take`
- **Interface:**
  - Titre + description quiz
  - Chronomètre (si limite temps)
  - Progression: "Question 3 sur 10"
  - Zone de réponse selon type
  - Boutons: Précédent / Suivant / Soumettre
- **Accessibilité:**
  - **Progression annoncée:** `aria-live="polite"` → *"Question 3 sur 10"*
  - **Question annoncée:** *"Question: Quelle est la capitale de la France ?"*
  - **Chronomètre annoncé:** `aria-live="polite"` → *"5 minutes restantes"*
  - **Navigation clavier complète:**
    - `Tab` : Parcourir options
    - `Espace` : Sélectionner
    - `Entrée` : Valider
    - Boutons "Suivant" / "Précédent" accessibles
  - **Confirmation avant soumission:**
    - Modal accessible
    - Message: *"Êtes-vous sûr de vouloir soumettre ? Vous ne pourrez plus modifier vos réponses."*
    - Focus sur "Annuler" par défaut (sécurité)
  - **Feedback vocal après soumission:**
    - `aria-live="assertive"` → *"Quiz soumis avec succès. Score: 85%. Vous avez réussi !"*

##### 3. Résultats (Professeur)
- **Route:** `/teacher/evaluations/:quizId/results`
- **Affichage:**
  - Score global
  - Nombre de bonnes réponses
  - Statut: Réussi / Échoué
  - Questions avec réponses correctes/incorrectes
  - Feedback par question
- **Mise à jour statut:**
  - Si réussi (≥70%) → `validationStatus` = `VERIFIED`
  - Si échoué → Reste `PENDING`, peut repasser

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Backend - Nouveaux Modèles

#### TeacherDocument
```prisma
model TeacherDocument {
  id          String   @id
  teacherId   String
  type        String   // DIPLOMA, CERTIFICATE, ID_CARD, OTHER
  fileName    String
  originalName String
  fileSize    Int
  mimeType    String
  filePath    String
  status      String   // PENDING, VERIFIED, REJECTED
  uploadedAt  DateTime
  verifiedAt  DateTime?
  verifiedBy  String?
}
```

#### EvaluationQuiz
```prisma
model EvaluationQuiz {
  id            String   @id
  schoolId      String
  title         String
  description   String?
  subject       String?
  passingScore  Int      @default(70)
  timeLimit     Int?
  status        String   // DRAFT, PUBLISHED, ARCHIVED
  questions     EvaluationQuestion[]
  assignments   EvaluationAssignment[]
}
```

#### EvaluationQuestion
```prisma
model EvaluationQuestion {
  id        String   @id
  quizId    String
  question  String
  type      String   // MCQ, TRUE_FALSE, SHORT_ANSWER
  options   String?  // JSON
  correctAnswer String
  points    Int
  order     Int
}
```

#### EvaluationAssignment
```prisma
model EvaluationAssignment {
  id          String   @id
  quizId      String
  teacherId   String
  status      String   // PENDING, STARTED, COMPLETED
  score       Float?
  passed      Boolean?
  answers     String?  // JSON
  startedAt   DateTime?
  completedAt DateTime?
  assignedAt  DateTime
}
```

### Backend - Endpoints API

#### Profils Professeurs
```
GET    /api/v1/teachers/:teacherId/profile   # Profil public
GET    /api/v1/teachers/profile               # Son propre profil
PUT    /api/v1/teachers/profile               # Modifier profil
POST   /api/v1/teachers/documents             # Upload document
GET    /api/v1/teachers/documents             # Liste documents
DELETE /api/v1/teachers/documents/:id         # Supprimer document
```

#### Quiz Évaluation
```
# Écoles
POST   /api/v1/evaluation/quizzes                # Créer quiz
POST   /api/v1/evaluation/quizzes/:id/assign     # Attribuer à prof
GET    /api/v1/evaluation/quizzes/:id/results    # Résultats

# Professeurs
GET    /api/v1/evaluation/assignments            # Liste quiz assignés
GET    /api/v1/evaluation/quizzes/:id            # Quiz à passer
POST   /api/v1/evaluation/quizzes/:id/submit     # Soumettre réponses
```

### Limite Quiz École - Logique Backend

```javascript
// ✅ Vérification limite mensuelle
const MONTHLY_QUIZ_LIMIT_FREE = 7;

if (!school.hasSubscription) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const quizzesThisMonth = await prisma.evaluationQuiz.count({
    where: {
      schoolId: school.id,
      createdAt: { gte: startOfMonth },
    },
  });
  
  if (quizzesThisMonth >= MONTHLY_QUIZ_LIMIT_FREE) {
    return res.status(403).json({
      success: false,
      message: `Limite mensuelle atteinte (${MONTHLY_QUIZ_LIMIT_FREE} quiz). Passez en premium.`,
      limitReached: true,
    });
  }
}
```

---

## ♿ ACCESSIBILITÉ - SPÉCIFICITÉS

### Upload Documents
```tsx
// ✅ Annonce vocale après upload
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {uploadMessage}
</div>

// Exemple: "Fichier diplome.pdf uploadé avec succès. Statut: En attente de vérification."
```

### Progression Quiz
```tsx
// ✅ Annonce automatique changement question
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Question {currentQuestion + 1} sur {totalQuestions}
</div>

// Exemple: "Question 3 sur 10"
```

### Chronomètre
```tsx
// ✅ Annonce toutes les minutes
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {timeRemaining}
</div>

// Exemple: "5 minutes restantes"
// Exemple: "1 minute restante"
// Exemple: "30 secondes restantes" (alert)
```

### Feedback Soumission
```tsx
// ✅ Annonce immédiate résultat
<div aria-live="assertive" aria-atomic="true">
  {resultMessage}
</div>

// Exemple: "Quiz soumis avec succès. Score: 85 sur 100. Vous avez réussi !"
// Exemple: "Quiz soumis. Score: 60 sur 100. Vous n'avez pas atteint le score minimum de 70. Vous pouvez repasser le quiz."
```

---

## 🧪 SCÉNARIOS DE TEST

### Scénario 1: Professeur crée son profil
```
1. Professeur se connecte
2. Va sur /teacher/profile/edit
3. Remplit bio, matières, expérience
4. Upload diplôme (PDF)
5. Entend: "Fichier diplome.pdf uploadé avec succès"
6. Sauvegarde profil
7. Entend: "Profil mis à jour avec succès"
8. Voir profil public sur /teachers/:id
```

### Scénario 2: École crée quiz d'évaluation
```
1. École (gratuite) se connecte
2. Va sur /school/evaluation/create
3. Voit: "6 quiz restants ce mois"
4. Crée quiz "Évaluation Mathématiques"
5. Ajoute 10 questions QCM
6. Publie le quiz
7. Voit: "5 quiz restants ce mois"
8. Attribue quiz au professeur "Jean Dupont"
9. Jean reçoit notification
```

### Scénario 3: Professeur passe quiz
```
1. Professeur se connecte
2. Va sur /teacher/evaluations
3. Voit quiz "Évaluation Mathématiques" (statut: PENDING)
4. Clique "Commencer"
5. Répond aux 10 questions
6. Entend progression: "Question 1 sur 10", "Question 2 sur 10", ...
7. Clique "Soumettre"
8. Confirme dans modal
9. Entend: "Quiz soumis. Score: 90%. Vous avez réussi !"
10. Statut professeur passe à VERIFIED
```

### Scénario 4: École dépasse limite
```
1. École gratuite se connecte
2. A déjà créé 7 quiz ce mois
3. Va sur /school/evaluation/create
4. Voit: "0 quiz restants ce mois"
5. Bouton "Créer quiz" désactivé
6. Message: "Limite mensuelle atteinte (7 quiz). Passez en premium."
7. CTA "Passer en premium" visible
```

### Scénario 5: Utilisateur aveugle (NVDA)
```
1. Active NVDA
2. Tab vers "Mon profil"
3. Entend: "Mon profil, lien"
4. Entrée
5. Entend: "Éditer votre profil professeur"
6. Tab vers "Bio"
7. Entend: "Biographie, zone de texte"
8. Tape bio
9. Tab vers "Upload diplôme"
10. Entend: "Choisir un fichier, bouton"
11. Sélectionne fichier
12. Entend: "Fichier diplome.pdf uploadé avec succès. Statut: En attente de vérification."
```

---

## 🚀 INSTALLATION

```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend
cd educonnect-app
npm install
npm run dev
```

---

## ✅ CHECKLIST VALIDATION

### Phase 6 - Profils
- [x] Profil professeur public visible
- [x] Édition profil fonctionnelle
- [x] Upload documents (backend prêt)
- [x] Statuts: PENDING, VERIFIED, REJECTED
- [x] Accessibilité profil (aria-label, lecteur d'écran)
- [x] Navigation clavier complète

### Phase 7 - Quiz Évaluation
- [x] Création quiz (école)
- [x] Limite 7 quiz/mois (gratuit) appliquée
- [x] Message limite accessible
- [x] Attribution quiz à professeur
- [x] Notification professeur
- [x] Liste quiz assignés (professeur)
- [x] Passage quiz avec accessibilité
- [x] Progression annoncée vocalement
- [x] Chronomètre accessible (si activé)
- [x] Soumission avec confirmation
- [x] Feedback vocal immédiat
- [x] Résultats pour école
- [x] Mise à jour statut professeur

---

## 📝 NOTES IMPORTANTES

### Différence Quiz Pédagogiques vs Quiz Évaluation

| Caractéristique | Quiz Pédagogiques | Quiz Évaluation |
|----------------|-------------------|-----------------|
| Créateur | Professeurs | Écoles |
| Destinataire | Élèves | Professeurs |
| Objectif | Apprentissage | Sélection/Validation |
| Limite | 7/jour (prof gratuit) | 7/mois (école gratuite) |
| Résultat | Note élève | Statut professeur (VERIFIED/REJECTED) |

### Statuts Professeur

1. **PENDING** (Non vérifié) - Par défaut à l'inscription
2. **VERIFIED** (Conforme) - Après réussite quiz OU validation manuelle admin
3. **REJECTED** (Refusé) - Après échec quiz OU rejet admin

---

## 🎯 PROCHAINES ÉTAPES (Hors Scope Phases 6-7)

- Gestion manuelle validation professeurs (Admin)
- Système de reviews/avis
- Calendrier disponibilités
- Réservation cours
- Paiements professeurs
- Historique transactions

---

**✅ PHASES 6 & 7 COMPLÈTES**

Profils professeurs crédibles + Système quiz d'évaluation par écoles.  
100% accessible pour utilisateurs aveugles (NVDA/VoiceOver).
