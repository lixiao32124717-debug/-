export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  color?: string; // Hex code for UI
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  totalProfit: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR';
}

export type ViewState = 'POS' | 'DASHBOARD' | 'INVENTORY' | 'HISTORY';

export interface SalesSummary {
  totalSales: number;
  totalProfit: number;
  transactionCount: number;
  averageTicket: number;
}
