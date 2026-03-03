export type TransactionType = 'recharge' | 'payment' | 'withdrawal' | 'commission';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  commission?: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  recipientId?: string;
  recipientName?: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: 'FCFA';
  transactions: Transaction[];
}
