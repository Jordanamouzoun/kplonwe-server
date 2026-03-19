import prisma from '../../lib/prisma.js';


/**
 * Récupérer les notifications de l'utilisateur
 * GET /api/v1/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;
    
    const notifications = await prisma.notificationModel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });
    
    const unreadCount = await prisma.notificationModel.count({
      where: { userId, isRead: false },
    });
    
    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message,
    });
  }
};

/**
 * Marquer une notification comme lue
 * PUT /api/v1/notifications/:notificationId/read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await prisma.notificationModel.findUnique({
      where: { id: notificationId },
    });
    
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée',
      });
    }
    
    await prisma.notificationModel.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
    
    res.json({
      success: true,
      message: 'Notification marquée comme lue',
    });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la notification',
      error: error.message,
    });
  }
};

/**
 * Marquer toutes les notifications comme lues
 * PUT /api/v1/notifications/read-all
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.notificationModel.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    
    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
    });
  } catch (error) {
    console.error('Erreur marquage toutes notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des notifications',
      error: error.message,
    });
  }
};
