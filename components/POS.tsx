import React, { useState, useMemo } from 'react';
import { Product, CartItem, Transaction } from '../types';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, QrCode, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../services/db';

interface POSProps {
  products: Product[];
  onTransactionComplete: () => void;
}

const POS: React.FC<POSProps> = ({ products, onTransactionComplete }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    if (cart.length <= 1) setShowMobileCart(false);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartProfit = cart.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0);

  const handlePrint = () => {
    if (cart.length === 0) return;

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert('请允许弹出窗口以使用打印功能');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>销售清单</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 320px; margin: 0 auto; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .store-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .meta { font-size: 12px; color: #555; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .item-name { flex: 1; padding-right: 10px; }
            .item-qty { width: 40px; text-align: center; }
            .item-price { width: 70px; text-align: right; }
            .divider { border-top: 1px dashed #000; margin: 15px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 5px; }
            .footer { text-align: center; font-size: 12px; margin-top: 25px; color: #666; }
            @media print {
              @page { margin: 0; }
              body { padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-title">SmartPOS 云收银</div>
            <div class="meta">日期: ${new Date().toLocaleString('zh-CN')}</div>
          </div>
          
          <div class="items">
            ${cart.map(item => `
              <div class="item-row">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">x${item.quantity}</span>
                <span class="item-price">¥${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="divider"></div>

          <div class="total-row">
            <span>总计</span>
            <span>¥${cartTotal.toFixed(2)}</span>
          </div>

          <div class="footer">
            <p>--- 仅供参考 ---</p>
            <p>谢谢惠顾，欢迎下次光临</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleCheckout = (method: 'CASH' | 'CARD' | 'QR') => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      items: [...cart],
      total: cartTotal,
      totalProfit: cartProfit,
      paymentMethod: method,
    };

    db.addTransaction(transaction);
    setCart([]);
    setShowMobileCart(false);
    onTransactionComplete();
    const methodMap = { CASH: '现金', CARD: '刷卡', QR: '扫码' };
    alert(`交易成功！通过 ${methodMap[method]} 收款 ¥${cartTotal.toFixed(2)}`);
  };

  const CartContent = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
            <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
            <p>购物车为空</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex-1 pr-3">
                <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-slate-500">¥{item.price.toFixed(2)} x {item.quantity}</div>
                  <div className="text-sm font-bold text-slate-700">¥{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:text-red-500 active:scale-95 transition-transform"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:text-green-500 active:scale-95 transition-transform"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-600">总金额</span>
          <span className="text-2xl font-bold text-slate-900">¥{cartTotal.toFixed(2)}</span>
        </div>
        
        <button 
          onClick={handlePrint}
          disabled={cart.length === 0}
          className="w-full mb-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Printer className="w-4 h-4" /> 打印购物清单
        </button>
        
        <div className="grid grid-cols-3 gap-2">
          <button 
            disabled={cart.length === 0}
            onClick={() => handleCheckout('CASH')}
            className="flex flex-col items-center justify-center p-3 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Banknote className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">现金</span>
          </button>
          <button 
            disabled={cart.length === 0}
            onClick={() => handleCheckout('CARD')}
            className="flex flex-col items-center justify-center p-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <CreditCard className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">刷卡</span>
          </button>
          <button 
            disabled={cart.length === 0}
            onClick={() => handleCheckout('QR')}
            className="flex flex-col items-center justify-center p-3 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <QrCode className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">扫码</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4 pb-24 md:pb-4 relative">
      {/* Product Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
          <input
            type="text"
            placeholder="搜索商品..."
            className="w-full px-4 py-3 md:py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  categoryFilter === cat 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? '全部' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col items-start p-3 md:p-4 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
              >
                <div 
                  className="w-full aspect-square mb-2 md:mb-3 rounded-lg flex items-center justify-center text-3xl shadow-inner"
                  style={{ backgroundColor: product.color || '#e2e8f0', color: 'white' }}
                >
                  {product.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-slate-800 line-clamp-1 text-sm md:text-base w-full text-left">{product.name}</h3>
                <div className="w-full flex justify-between items-center mt-1">
                  <p className="text-accent font-bold">¥{product.price.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">成本:¥{product.cost.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
          {/* Spacer for mobile bottom bar */}
          <div className="h-20 lg:hidden"></div>
        </div>
      </div>

      {/* Desktop Cart Section */}
      <div className="hidden lg:flex w-96 flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden h-full">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> 当前订单
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
            {cartItemCount} 件商品
          </span>
        </div>
        <CartContent />
      </div>

      {/* Mobile Cart Floating Bar */}
      <div className="lg:hidden fixed bottom-16 md:bottom-4 left-4 right-4 z-30">
        <button 
          onClick={() => setShowMobileCart(!showMobileCart)}
          className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center hover:bg-slate-800 transition-all border border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="font-bold text-lg">¥{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            {showMobileCart ? '隐藏详情' : '去结算'}
            {showMobileCart ? <ChevronDown className="w-4 h-4"/> : <ChevronUp className="w-4 h-4"/>}
          </div>
        </button>
      </div>

      {/* Mobile Cart Overlay/Modal */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileCart(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
             <div className="flex justify-center p-2" onClick={() => setShowMobileCart(false)}>
                <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-lg">购物车</h2>
                <button onClick={() => setCart([])} className="text-sm text-red-500 flex items-center gap-1">
                   <Trash2 className="w-3 h-3"/> 清空
                </button>
             </div>
             <CartContent />
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;