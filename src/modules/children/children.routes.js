import express from 'express';
import { createChild, getChildren, deleteChild } from './children.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Créer un compte enfant
router.post('/', createChild);

// Récupérer tous les enfants du parent connecté
router.get('/', getChildren);

// Supprimer un compte enfant
router.delete('/:childId', deleteChild);

export default router;
