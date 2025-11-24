import { Product, Transaction } from '../types';

const PRODUCTS_KEY = 'smartpos_products';
const TRANSACTIONS_KEY = 'smartpos_transactions';

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: '拿铁咖啡', price: 28.00, cost: 8.00, category: '咖啡', color: '#78350f' },
  { id: '2', name: '卡布奇诺', price: 26.00, cost: 7.50, category: '咖啡', color: '#92400e' },
  { id: '3', name: '意式浓缩', price: 18.00, cost: 5.00, category: '咖啡', color: '#451a03' },
  { id: '4', name: '羊角面包', price: 15.00, cost: 6.00, category: '食品', color: '#d97706' },
  { id: '5', name: '蓝莓松饼', price: 18.00, cost: 7.00, category: '食品', color: '#2563eb' },
  { id: '6', name: '冰柠檬茶', price: 20.00, cost: 3.00, category: '饮品', color: '#059669' },
];

export const db = {
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(stored);
  },

  saveProduct: (product: Product) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  deleteProduct: (id: string) => {
    const products = db.getProducts().filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  getTransactions: (): Transaction[] => {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addTransaction: (transaction: Transaction) => {
    const transactions = db.getTransactions();
    transactions.unshift(transaction); // Newest first
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  },

  // Simulate Cloud Sync
  exportData: () => {
    const data = {
      products: db.getProducts(),
      transactions: db.getTransactions(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.products && Array.isArray(data.products)) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.products));
      }
      if (data.transactions && Array.isArray(data.transactions)) {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
      }
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
};