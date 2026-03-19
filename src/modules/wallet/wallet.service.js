import prisma from '../../lib/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';


export const getWalletByUserId = async (userId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactionsFrom: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      transactionsTo: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!wallet) {
    throw new AppError('Wallet introuvable', 404);
  }

  return wallet;
};

export const getWalletTransactions = async (userId, page, limit) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet introuvable', 404);

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromWalletId: wallet.id },
        { toWalletId: wallet.id }
      ]
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  });

  const total = await prisma.transaction.count({
    where: {
      OR: [
        { fromWalletId: wallet.id },
        { toWalletId: wallet.id }
      ]
    }
  });

  return { transactions, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getWalletBalance = async (userId) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet introuvable', 404);
  return wallet.balance;
};

export const updateWalletBalance = async (walletId, amount, operation = 'add') => {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) throw new AppError('Wallet introuvable', 404);

  if (wallet.isLocked) {
    throw new AppError('Wallet verrouillé', 403);
  }

  const newBalance = operation === 'add' ? wallet.balance + amount : wallet.balance - amount;

  if (newBalance < 0) {
    throw new AppError('Solde insuffisant', 400);
  }

  return await prisma.wallet.update({
    where: { id: walletId },
    data: { balance: newBalance }
  });
};
