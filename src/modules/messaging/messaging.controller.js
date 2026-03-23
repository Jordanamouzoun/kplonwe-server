import prisma from '../../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';


// Vérifier si la conversation est autorisée selon les règles métier
function isConversationAllowed(role1, role2) {
  const allowed = [
    ['PARENT', 'TEACHER'],
    ['TEACHER', 'PARENT'],
    ['TEACHER', 'STUDENT'],
    ['STUDENT', 'TEACHER'],
    ['SCHOOL', 'TEACHER'],
    ['TEACHER', 'SCHOOL'],
  ];
  
  return allowed.some(([r1, r2]) => 
    (role1 === r1 && role2 === r2) || (role1 === r2 && role2 === r1)
  );
}

/**
 * Créer ou récupérer une conversation
 * POST /api/v1/messages/conversations
 */
export const createOrGetConversation = async (req, res) => {
  try {
    const { participant2Id } = req.body;
    const participant1Id = req.user.id;
    
    // Récupérer les utilisateurs
    logger.info(`Création conversation: p1=${participant1Id}, p2=${participant2Id}`);
    const user1 = await prisma.user.findUnique({ where: { id: participant1Id } });
    const user2 = await prisma.user.findUnique({ where: { id: participant2Id } });
    
    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }
    
    // Vérifier règles métier
    if (!isConversationAllowed(user1.role, user2.role)) {
      return res.status(403).json({
        success: false,
        message: 'Conversation non autorisée entre ces rôles',
      });
    }
    
    // Chercher conversation existante (dans les 2 sens)
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: participant1Id,
            participant2Id: participant2Id,
          },
          {
            participant1Id: participant2Id,
            participant2Id: participant1Id,
          },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    
    // Créer si n'existe pas
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: uuidv4(),
          participant1Id,
          participant1Role: user1.role,
          participant2Id,
          participant2Role: user2.role,
        },
        include: {
          messages: true,
        },
      });
    }
    
    res.json({
      success: true,
      conversation: {
        ...conversation,
        participant1: { id: user1.id, firstName: user1.firstName, lastName: user1.lastName, role: user1.role, avatar: user1.avatar },
        participant2: { id: user2.id, firstName: user2.firstName, lastName: user2.lastName, role: user2.role, avatar: user2.avatar },
      },
    });
  } catch (error) {
    logger.error('Erreur création conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la conversation',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Récupérer toutes les conversations de l'utilisateur
 * GET /api/v1/messages/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
    
    // Enrichir avec les infos des participants
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { id: true, firstName: true, lastName: true, role: true, avatar: true },
        });
        
        // Compter messages non lus
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            readAt: null,
          },
        });
        
        return {
          ...conv,
          otherUser,
          unreadCount,
          lastMessage: conv.messages[0] || null,
        };
      })
    );
    
    res.json({
      success: true,
      conversations: enrichedConversations,
    });
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message,
    });
  }
};

/**
 * Récupérer les messages d'une conversation
 * GET /api/v1/messages/conversations/:conversationId
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée',
      });
    }
    
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation',
      });
    }
    
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message,
    });
  }
};

/**
 * Envoyer un message
 * POST /api/v1/messages/conversations/:conversationId/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le message ne peut pas être vide',
      });
    }
    
    // Vérifier conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée',
      });
    }
    
    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
      });
    }
    
    // Vérifier si bloqué
    if (conversation.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Cette conversation est bloquée',
      });
    }
    
    const receiverId = conversation.participant1Id === senderId 
      ? conversation.participant2Id 
      : conversation.participant1Id;
    
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    
    // Créer le message
    const message = await prisma.message.create({
      data: {
        id: uuidv4(),
        conversationId,
        senderId,
        senderRole: sender.role,
        receiverId,
        receiverRole: receiver.role,
        content: content.trim(),
      },
    });
    
    // Mettre à jour lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    
    // Créer notification
    await prisma.notificationModel.create({
      data: {
        id: uuidv4(),
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'Nouveau message',
        message: `${sender.firstName} ${sender.lastName} vous a envoyé un message`,
        data: JSON.stringify({ conversationId, messageId: message.id }),
      },
    });
    
    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message,
    });
  }
};

/**
 * Marquer les messages comme lus
 * PUT /api/v1/messages/conversations/:conversationId/read
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
    
    res.json({
      success: true,
      message: 'Messages marqués comme lus',
    });
  } catch (error) {
    console.error('Erreur marquage lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages',
      error: error.message,
    });
  }
};
