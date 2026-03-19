import prisma from '../../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'teacher-documents');

/**
 * Upload un document (diplôme, certificat)
 * POST /api/v1/teachers/documents
 */
export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;
    
    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      });
    }
    
    // Vérifier que l'utilisateur est professeur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || user.role !== 'TEACHER' || !user.teacherProfile) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les professeurs peuvent uploader des documents',
      });
    }
    
    // Créer le document en base
    const document = await prisma.teacherDocument.create({
      data: {
        id: uuidv4(),
        teacherId: user.teacherProfile.id,
        type: type || 'OTHER',
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        filePath: `/uploads/teacher-documents/${req.file.filename}`,
        status: 'PENDING',
      },
    });
    
    res.status(201).json({
      success: true,
      message: 'Document uploadé avec succès',
      document,
    });
  } catch (error) {
    console.error('Erreur upload document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du document',
      error: error.message,
    });
  }
};

/**
 * Récupérer tous les documents d'un professeur
 * GET /api/v1/teachers/documents
 */
export const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || !user.teacherProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil professeur non trouvé',
      });
    }
    
    const documents = await prisma.teacherDocument.findMany({
      where: { teacherId: user.teacherProfile.id },
      orderBy: { uploadedAt: 'desc' },
    });
    
    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Erreur récupération documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message,
    });
  }
};

/**
 * Supprimer un document
 * DELETE /api/v1/teachers/documents/:documentId
 */
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || !user.teacherProfile) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }
    
    // Vérifier que le document appartient au professeur
    const document = await prisma.teacherDocument.findUnique({
      where: { id: documentId },
    });
    
    if (!document || document.teacherId !== user.teacherProfile.id) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé',
      });
    }
    
    // Supprimer le fichier physique (si existe)
    try {
      await fs.unlink(path.join(process.cwd(), document.filePath));
    } catch (err) {
      // Fichier n'existe peut-être pas, continuer quand même
    }
    
    // Supprimer de la base
    await prisma.teacherDocument.delete({
      where: { id: documentId },
    });
    
    res.json({
      success: true,
      message: 'Document supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error.message,
    });
  }
};

/**
 * Récupérer documents publics d'un professeur (pour parents/écoles)
 * GET /api/v1/teachers/:teacherId/documents
 */
export const getPublicDocuments = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Vérifier que le professeur existe
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Professeur non trouvé',
      });
    }
    
    // Récupérer documents
    let documents = await prisma.teacherDocument.findMany({
      where: { teacherId },
      orderBy: { uploadedAt: 'desc' },
    });
    
    // Tous les visiteurs voient les documents PENDING et VERIFIED.
    // Seuls les documents REJECTED sont masqués (document refusé par l'admin).
    // Le professeur propriétaire voit absolument tout.
    const isOwner = req.user && teacher.userId && req.user.id === teacher.userId;
    if (!isOwner) {
      documents = documents.filter(d => d.status !== 'REJECTED');
    }
    
    res.json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error('Erreur récupération documents publics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message,
    });
  }
};
