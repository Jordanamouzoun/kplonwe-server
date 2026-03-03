const express = require('express');
const router = express.Router();
const childrenController = require('../controllers/children.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Créer un compte enfant
router.post('/', childrenController.createChild);

// Récupérer tous les enfants du parent connecté
router.get('/', childrenController.getChildren);

// Supprimer un compte enfant
router.delete('/:childId', childrenController.deleteChild);

module.exports = router;
