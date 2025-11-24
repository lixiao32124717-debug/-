import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, Eye, X, FileText, Calendar, CreditCard, Banknote, QrCode, ChevronRight } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
}

const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(tx => {
    const term = searchTerm.toLowerCase();
    const dateStr = new Date(tx.timestamp).toLocaleDateString('zh-CN'); // e.g., 2023/10/01
    const idStr = tx.id.toLowerCase();
    // Search by ID or Date
    return idStr.includes(term) || dateStr.includes(term);
  });

  const getMethodLabel = (method: string) => {
    switch(method) {
      case 'CASH': return { label: '现金', icon: Banknote, color: 'text-green-600 bg-green-100' };
      case 'CARD': return { label: '刷卡', icon: CreditCard, color: 'text-blue-600 bg-blue-100' };
      case 'QR': return { label: '扫码', icon: QrCode, color: 'text-purple-600 bg-purple-100' };
      default: return { label: '未知', icon: FileText, color: 'text-slate-600 bg-slate-100' };
    }
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">销售记录</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索单号或日期..."
            className="w-full pl-10 pr-4 py-3 md:py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-slate-500">
            <FileText className="w-12 h-12 mb-4 text-slate-300" />
            <p>暂无交易记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">时间</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">单号</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">概览</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">支付</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">总金额</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(tx => {
                  const methodStyle = getMethodLabel(tx.paymentMethod);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(tx.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {tx.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-slate-800 text-sm">
                        {tx.items.length} 件商品
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${methodStyle.color}`}>
                          <methodStyle.icon className="w-3 h-3" />
                          {methodStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ¥{tx.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setSelectedTx(tx)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                没有找到匹配的记录。
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-3">
         {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              无交易记录
            </div>
         )}
         {filteredTransactions.map(tx => {
            const methodStyle = getMethodLabel(tx.paymentMethod);
            return (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-lg">¥{tx.total.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-mono">#{tx.id.slice(0, 8)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${methodStyle.color}`}>
                    <methodStyle.icon className="w-3 h-3" />
                    {methodStyle.label}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-sm border-t border-slate-50 pt-2 mt-2">
                   <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.timestamp).toLocaleString('zh-CN', {month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                   </div>
                   <div className="flex items-center gap-1 text-primary">
                      {tx.items.length} 件商品 <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
            )
         })}
      </div>

      {/* Transaction Details Modal (Responsive) */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTx(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  订单详情
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedTx.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-4 md:p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-slate-500">
                  <p className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedTx.timestamp).toLocaleString('zh-CN')}
                  </p>
                  <p className="flex items-center gap-2">
                    {(() => {
                      const m = getMethodLabel(selectedTx.paymentMethod);
                      return <><m.icon className="w-4 h-4" /> 支付方式: {m.label}</>;
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">¥{selectedTx.total.toFixed(2)}</div>
                  <div className="text-xs text-emerald-600 font-medium">包含利润: ¥{selectedTx.totalProfit.toFixed(2)}</div>
                </div>
              </div>

              <div className="border rounded-xl border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">商品</th>
                      <th className="px-4 py-3 font-medium text-center">数量</th>
                      <th className="px-4 py-3 font-medium text-right hidden md:table-cell">单价</th>
                      <th className="px-4 py-3 font-medium text-right">小计</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTx.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-slate-800">
                          {item.name}
                          <div className="md:hidden text-xs text-slate-400">¥{item.price.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">x{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">¥{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                          ¥{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-full md:w-auto px-6 py-3 md:py-2 bg-slate-900 text-white rounded-xl md:rounded-lg hover:bg-slate-800 font-medium shadow-lg shadow-slate-900/10 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;