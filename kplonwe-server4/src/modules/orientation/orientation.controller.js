/**
 * orientation.controller.js — V1 Mock
 * V2 : remplacer getMockOrientation() par appel IA sans rien changer d'autre.
 */

function getMockOrientation(studentId) {
  const seed = studentId ? studentId.charCodeAt(0) % 4 : 0;
  const profiles = [
    {
      profileType: 'Analytique & Logique', globalScore: 87,
      description: 'Tu excelles dans la résolution de problèmes complexes. Ton esprit analytique te prédispose aux métiers de la technologie et des sciences exactes.',
      strengths: ['Raisonnement algorithmique', 'Précision et rigueur', 'Résolution de problèmes'],
      traits: [
        { name: 'Logique',       score: 92, color: '#3b82f6' },
        { name: 'Analytique',    score: 88, color: '#6366f1' },
        { name: 'Mathématiques', score: 85, color: '#8b5cf6' },
        { name: 'Créativité',    score: 62, color: '#f59e0b' },
        { name: 'Communication', score: 70, color: '#10b981' },
        { name: 'Leadership',    score: 74, color: '#ef4444' },
      ],
      careers: [
        { title: 'Ingénieur Logiciel',       field: 'Technologie',       match: 95, salary: '400 000 – 900 000 FCFA/mois',   description: 'Conception et développement de systèmes informatiques complexes.',         reason: 'Ton score logique de 92% correspond parfaitement aux exigences du développement logiciel.' },
        { title: 'Data Scientist',           field: 'IA & Données',      match: 91, salary: '500 000 – 1 200 000 FCFA/mois', description: 'Analyse de données massives pour générer des insights stratégiques.',       reason: 'Tes aptitudes mathématiques et ton raisonnement analytique sont les piliers de ce métier.' },
        { title: 'Architecte Systèmes',      field: 'Infrastructure IT', match: 83, salary: '600 000 – 1 500 000 FCFA/mois', description: "Conception des architectures techniques des systèmes d'information.",       reason: 'Ta capacité à structurer des problèmes complexes est exactement ce que requiert ce rôle.' },
        { title: 'Ingénieur Cybersécurité',  field: 'Sécurité',          match: 79, salary: '450 000 – 1 100 000 FCFA/mois', description: 'Protection des systèmes informatiques contre les menaces.',                reason: 'La rigueur et la logique sont les qualités #1 en cybersécurité.' },
      ],
      fields: [
        { name: 'Informatique & Génie Logiciel', match: 95, duration: 'Bac +5',      description: 'Développement, algorithmes et architecture' },
        { name: 'Intelligence Artificielle',     match: 90, duration: 'Bac +5',      description: 'Machine learning et traitement de données' },
        { name: 'Réseaux & Cybersécurité',       match: 80, duration: 'Bac +3 à +5', description: 'Infrastructure et sécurité des systèmes' },
        { name: 'Mathématiques Appliquées',      match: 82, duration: 'Bac +5',      description: 'Statistiques, modélisation, recherche' },
      ],
      schools: [
        { name: 'Institut Universitaire de Technologie (IUT)', location: 'Cotonou',        type: 'Public',             fields: ['Informatique', 'Réseaux', 'Génie Électrique'],       match: 93 },
        { name: 'École Supérieure du Numérique (ESN)',         location: 'Cotonou',        type: 'Privé agréé',        fields: ['Développement Web', 'Data Science', 'Cybersécurité'], match: 91 },
        { name: "Université d'Abomey-Calavi (UAC)",           location: 'Abomey-Calavi', type: 'Public',             fields: ['Mathématiques', 'Informatique', 'Physique'],           match: 85 },
        { name: 'Institut Africain Informatique (IAI)',        location: 'Cotonou',        type: 'Intergouvernemental', fields: ['Informatique', 'Télécoms', 'Systèmes'],               match: 88 },
      ],
    },
    {
      profileType: 'Créatif & Innovant', globalScore: 84,
      description: "Tu as un esprit créatif remarquable. Tu t'épanouis dans les environnements qui valorisent l'innovation et l'expression visuelle.",
      strengths: ['Pensée créative', 'Sens esthétique développé', 'Communication visuelle'],
      traits: [
        { name: 'Créativité',    score: 95, color: '#f59e0b' },
        { name: 'Innovation',    score: 88, color: '#ef4444' },
        { name: 'Communication', score: 82, color: '#10b981' },
        { name: 'Logique',       score: 65, color: '#3b82f6' },
        { name: 'Analytique',    score: 70, color: '#6366f1' },
        { name: 'Leadership',    score: 78, color: '#8b5cf6' },
      ],
      careers: [
        { title: 'Designer UX/UI',        field: 'Design Digital',       match: 96, salary: '300 000 – 800 000 FCFA/mois',   description: "Conception d'interfaces utilisateur intuitives et esthétiques.", reason: 'Créativité 95% + Communication 82% = profil UX Designer idéal.' },
        { title: 'Directeur Artistique',  field: 'Communication',        match: 90, salary: '350 000 – 900 000 FCFA/mois',   description: 'Direction de la vision créative des marques.',                  reason: "Ton sens de l'innovation te prédispose à ce rôle de direction créative." },
        { title: 'Développeur Front-End', field: 'Technologie créative', match: 82, salary: '250 000 – 700 000 FCFA/mois',   description: "Création d'interfaces web visuellement impactantes.",           reason: 'La combinaison créativité + logique est la clé du développement frontend.' },
        { title: 'Product Manager',       field: 'Management Produit',   match: 78, salary: '500 000 – 1 200 000 FCFA/mois', description: 'Pilotage de la vision des produits numériques.',                reason: 'Innovation + Communication + Vision : le triptyque parfait du PM.' },
      ],
      fields: [
        { name: 'Design Graphique & Numérique', match: 95, duration: 'Bac +3',      description: 'Identité visuelle, motion design, UX/UI' },
        { name: 'Communication & Marketing',    match: 88, duration: 'Bac +3 à +5', description: 'Stratégie de marque, communication digitale' },
        { name: 'Architecture',                 match: 82, duration: 'Bac +5',      description: 'Conception de bâtiments et espaces' },
        { name: 'Arts Numériques',              match: 86, duration: 'Bac +3',      description: 'Multimédia, 3D, animation, jeux vidéo' },
      ],
      schools: [
        { name: "École des Beaux-Arts de Cotonou",            location: 'Cotonou',        type: 'Public',      fields: ['Design', 'Arts Plastiques', 'Communication Visuelle'],    match: 94 },
        { name: 'Institut Supérieur de Communication (ISCOM)', location: 'Cotonou',        type: 'Privé agréé', fields: ['Communication', 'Marketing', 'Journalisme'],              match: 90 },
        { name: 'Academy of Digital Arts',                    location: 'Cotonou',        type: 'Privé',       fields: ['UX/UI Design', 'Motion Design', 'Développement Web'],    match: 88 },
        { name: "École Supérieure d'Architecture (ESA)",      location: 'Abomey-Calavi', type: 'Privé agréé', fields: ['Architecture', 'Urbanisme', "Design d'Intérieur"],        match: 82 },
      ],
    },
    {
      profileType: 'Leader & Entrepreneur', globalScore: 89,
      description: 'Tu possèdes un charisme naturel et une capacité à fédérer les équipes. Tu es fait pour diriger, convaincre et bâtir.',
      strengths: ['Vision stratégique', 'Communication persuasive', "Gestion d'équipe"],
      traits: [
        { name: 'Leadership',    score: 94, color: '#ef4444' },
        { name: 'Communication', score: 91, color: '#10b981' },
        { name: 'Innovation',    score: 85, color: '#f59e0b' },
        { name: 'Analytique',    score: 80, color: '#6366f1' },
        { name: 'Logique',       score: 76, color: '#3b82f6' },
        { name: 'Créativité',    score: 72, color: '#8b5cf6' },
      ],
      careers: [
        { title: 'Entrepreneur',            field: 'Business',   match: 97, salary: 'Variable — illimité',           description: "Création et développement d'entreprises innovantes.",             reason: 'Leadership 94% + Communication 91% + Innovation 85% : profil entrepreneurial rare.' },
        { title: 'Manager de Projet',       field: 'Management', match: 91, salary: '400 000 – 1 000 000 FCFA/mois', description: 'Pilotage de projets complexes multi-équipes.',                     reason: 'Ta capacité à organiser, motiver et diriger est ce que requiert ce rôle.' },
        { title: 'Consultant en Stratégie', field: 'Conseil',    match: 87, salary: '500 000 – 1 500 000 FCFA/mois', description: "Accompagnement des dirigeants dans leurs décisions stratégiques.", reason: 'Analyse + Vision + Communication = profil consultant de premier ordre.' },
        { title: 'Directeur Commercial',    field: 'Commerce',   match: 84, salary: '450 000 – 1 200 000 FCFA/mois', description: 'Développement commercial et management des ventes.',               reason: 'Ton leadership naturel et ta communication fluide sont les clés du succès commercial.' },
      ],
      fields: [
        { name: 'Management & Administration', match: 94, duration: 'Bac +5',      description: 'MBA, gestion, stratégie' },
        { name: "Droit des Affaires",          match: 82, duration: 'Bac +5',      description: 'Droit commercial, contrats' },
        { name: 'Finance & Comptabilité',      match: 85, duration: 'Bac +3 à +5', description: 'Gestion financière, audit, banque' },
        { name: 'Sciences Politiques',         match: 78, duration: 'Bac +5',      description: 'Politique publique, relations internationales' },
      ],
      schools: [
        { name: 'Institut Supérieur de Management (ISM)',          location: 'Cotonou',        type: 'Privé agréé',      fields: ['Management', 'Finance', 'Marketing'],              match: 95 },
        { name: 'ESGIS Business School',                           location: 'Cotonou',        type: 'Privé',            fields: ['MBA', 'Entrepreneuriat', 'Commerce International'], match: 92 },
        { name: 'Faculté de Droit et de Science Politique (FDSP)', location: 'Abomey-Calavi', type: 'Public',           fields: ['Droit', 'Sciences Politiques', 'Administration'],  match: 83 },
        { name: "Université Catholique de l'Afrique (UCAO)",       location: 'Cotonou',        type: 'Privé catholique', fields: ['Management', 'Droit', 'Économie'],                 match: 87 },
      ],
    },
    {
      profileType: 'Humaniste & Social', globalScore: 82,
      description: "Tu as une empathie remarquable et un profond désir d'aider les autres. Tu es fait pour les métiers qui mettent l'humain au centre.",
      strengths: ['Intelligence émotionnelle', 'Écoute active', 'Sens du service'],
      traits: [
        { name: 'Empathie',      score: 96, color: '#10b981' },
        { name: 'Communication', score: 89, color: '#6366f1' },
        { name: 'Leadership',    score: 80, color: '#ef4444' },
        { name: 'Créativité',    score: 75, color: '#f59e0b' },
        { name: 'Logique',       score: 72, color: '#3b82f6' },
        { name: 'Analytique',    score: 68, color: '#8b5cf6' },
      ],
      careers: [
        { title: 'Médecin Généraliste',      field: 'Santé',               match: 91, salary: '600 000 – 2 000 000 FCFA/mois', description: 'Diagnostic, traitement et suivi des patients.',                reason: "Ton empathie exceptionnelle est la base d'une excellente relation patient-médecin." },
        { title: 'Psychologue Clinicien',    field: 'Santé Mentale',       match: 93, salary: '350 000 – 900 000 FCFA/mois',   description: 'Accompagnement psychologique des personnes en difficulté.', reason: "Empathie 96% + Communication 89% = profil psychologue d'excellence." },
        { title: 'Enseignant-Chercheur',     field: 'Éducation',           match: 88, salary: '300 000 – 700 000 FCFA/mois',   description: 'Transmission du savoir et contribution à la recherche.',    reason: 'Transmettre et faire grandir les autres est ta vocation naturelle.' },
        { title: 'Travailleur Social / ONG', field: 'Développement Social', match: 85, salary: '250 000 – 600 000 FCFA/mois',  description: 'Accompagnement des populations vulnérables.',               reason: "Ton désir d'aider et ton sens du collectif trouvent ici leur expression parfaite." },
      ],
      fields: [
        { name: 'Médecine & Sciences de la Santé', match: 90, duration: 'Bac +7 à +11', description: 'Médecine, pharmacie, soins infirmiers' },
        { name: 'Psychologie',                     match: 93, duration: 'Bac +5',        description: 'Clinique, sociale, du travail, scolaire' },
        { name: "Sciences de l'Éducation",         match: 87, duration: 'Bac +3 à +5',  description: 'Pédagogie, formation, orientation' },
        { name: 'Sociologie & Développement',      match: 81, duration: 'Bac +3 à +5',  description: 'Analyse sociale, coopération internationale' },
      ],
      schools: [
        { name: 'Faculté des Sciences de la Santé (FSS)',       location: 'Cotonou',        type: 'Public', fields: ['Médecine', 'Pharmacie', 'Soins Infirmiers'],                match: 91 },
        { name: 'Faculté des Lettres et Sci. Humaines (FLASH)', location: 'Abomey-Calavi', type: 'Public', fields: ['Psychologie', 'Sociologie', "Sciences de l'Éducation"],    match: 88 },
        { name: 'Institut National de la Jeunesse (INJ)',       location: 'Cotonou',        type: 'Public', fields: ['Sciences Sociales', 'Animation', 'Développement'],         match: 86 },
        { name: 'Institut de Formation en Sciences de la Santé', location: 'Parakou',       type: 'Public', fields: ['Santé Publique', 'Soins', 'Épidémiologie'],               match: 83 },
      ],
    },
  ];
  return profiles[seed];
}

export const getOrientation = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (req.user.role === 'STUDENT' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    const data = getMockOrientation(studentId);
    res.json({ success: true, studentId, generatedAt: new Date().toISOString(), aiPowered: false, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la génération des recommandations' });
  }
};
