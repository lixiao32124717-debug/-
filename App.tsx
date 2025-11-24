import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, History, Store } from 'lucide-react';
import { db } from './services/db';
import { Product, Transaction, ViewState } from './types';
import POS from './components/POS';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('POS');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadData = () => {
    setProducts(db.getProducts());
    setTransactions(db.getTransactions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const NavItem = ({ id, icon: Icon, label }: { id: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setView(id)}
      className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-6 md:py-3 rounded-xl transition-all w-full md:w-auto active:scale-95 md:active:scale-100 ${
        view === id 
          ? 'bg-primary text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-6 h-6 md:w-5 md:h-5 ${view === id ? 'text-blue-300 md:text-white' : ''}`} />
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full md:w-64 md:relative bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50 order-2 md:order-1 flex md:flex-col justify-around md:justify-start p-2 md:p-4 gap-1 md:gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none h-16 md:h-screen">
        <div className="hidden md:flex items-center gap-3 px-6 py-6 mb-4">
          <div className="bg-primary p-2 rounded-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">智能收银</span>
        </div>

        <NavItem id="POS" icon={ShoppingCart} label="收银台" />
        <NavItem id="DASHBOARD" icon={LayoutDashboard} label="仪表盘" />
        <NavItem id="INVENTORY" icon={Package} label="商品" />
        <NavItem id="HISTORY" icon={History} label="记录" />
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden order-1 md:order-2 relative bg-slate-50/50 pb-16 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-center font-bold text-slate-800 sticky top-0 z-40 shrink-0 shadow-sm">
           智能收银云
        </div>

        <div className="animate-fade-in h-full overflow-y-auto md:overflow-hidden">
          {view === 'POS' && (
            <POS 
              products={products} 
              onTransactionComplete={loadData} 
            />
          )}
          {view === 'DASHBOARD' && (
            <Dashboard transactions={transactions} />
          )}
          {view === 'INVENTORY' && (
            <Inventory 
              products={products} 
              onUpdate={loadData} 
            />
          )}
          {view === 'HISTORY' && (
            <Transactions transactions={transactions} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;