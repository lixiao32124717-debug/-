import React, { useState } from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, BrainCircuit } from 'lucide-react';
import { analyzeSales } from '../services/gemini';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Stats Logic
  const today = new Date().toDateString();
  const todaysTx = transactions.filter(t => new Date(t.timestamp).toDateString() === today);
  const totalSalesToday = todaysTx.reduce((acc, t) => acc + t.total, 0);
  const totalProfitToday = todaysTx.reduce((acc, t) => acc + t.totalProfit, 0);
  const orderCount = todaysTx.length;

  // Chart Data Preparation (Last 7 Days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    
    const dailyTx = transactions.filter(t => new Date(t.timestamp).toDateString() === dateStr);
    const sales = dailyTx.reduce((acc, t) => acc + t.total, 0);
    const profit = dailyTx.reduce((acc, t) => acc + t.totalProfit, 0);

    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return {
      name: weekdays[d.getDay()],
      Sales: sales,
      Profit: profit,
    };
  });

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await analyzeSales(transactions);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
          <p className="text-slate-500">今日经营概览</p>
        </div>
        <button
          onClick={handleAiAnalysis}
          disabled={loadingAi}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
        >
          <BrainCircuit className="w-5 h-5" />
          {loadingAi ? '正在分析...' : 'AI 智能分析'}
        </button>
      </div>

      {/* AI Result Section */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 animate-fade-in">
          <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" /> AI 经营洞察
          </h3>
          <div className="prose prose-indigo max-w-none text-slate-700 whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="今日销售额" 
          value={`¥${totalSalesToday.toFixed(2)}`} 
          icon={DollarSign} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="今日利润" 
          value={`¥${totalProfitToday.toFixed(2)}`} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="订单数" 
          value={orderCount} 
          icon={ShoppingBag} 
          color="bg-orange-500" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
          <h3 className="font-bold text-slate-800 mb-6">销售趋势 (近7天)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f8fafc'}}
              />
              <Bar dataKey="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
          <h3 className="font-bold text-slate-800 mb-6">利润趋势</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 0, fill: '#10b981'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;