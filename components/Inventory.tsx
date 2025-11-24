import React, { useState } from 'react';
import { Product } from '../types';
import { db } from '../services/db';
import { Plus, Trash2, Edit2, Save, X, RefreshCw, ChevronRight } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdate: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [showForm, setShowForm] = useState(false);

  // Import related state
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const initialForm: Partial<Product> = {
    name: '',
    price: 0,
    cost: 0,
    category: '通用',
    color: '#3b82f6'
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(product.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此商品吗？')) {
      db.deleteProduct(id);
      onUpdate();
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    const product: Product = {
      id: isEditing || crypto.randomUUID(),
      name: formData.name,
      price: Number(formData.price),
      cost: Number(formData.cost || 0),
      category: formData.category || '通用',
      color: formData.color || '#3b82f6',
    };

    db.saveProduct(product);
    onUpdate();
    setShowForm(false);
    setIsEditing(null);
    setFormData(initialForm);
  };

  const handleExport = () => {
    db.exportData();
  };

  const handleImport = () => {
    if (db.importData(importText)) {
      alert("数据导入成功!");
      onUpdate();
      setShowImport(false);
      setImportText('');
    } else {
      alert("无效的 JSON 数据");
    }
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">库存管理</h1>
           <p className="text-slate-500 text-sm md:text-base">管理您的商品目录</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <button 
            onClick={() => { setShowImport(!showImport); }} 
            className="flex-1 md:flex-none justify-center px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> 备份/同步
          </button>
          <button 
            onClick={() => {
              setFormData(initialForm);
              setIsEditing(null);
              setShowForm(true);
            }} 
            className="flex-1 md:flex-none justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-slate-800 font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> 添加商品
          </button>
        </div>
      </div>

      {showImport && (
        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
           <h3 className="font-bold mb-2">云同步 / 数据传输</h3>
           <p className="text-sm text-slate-500 mb-3">复制以下文本以导出数据，或粘贴数据以导入。</p>
           <div className="flex gap-2 mb-3">
             <button onClick={handleExport} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-bold">下载备份 (导出)</button>
           </div>
           <textarea 
            className="w-full h-24 border rounded p-2 text-xs font-mono"
            placeholder="在此粘贴 JSON 数据以导入..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
           />
           <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowImport(false)} className="px-3 py-1 text-sm text-slate-500">取消</button>
              <button onClick={handleImport} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">导入数据</button>
           </div>
        </div>
      )}

      {/* Form Modal/Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{isEditing ? '编辑商品' : '新增商品'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">商品名称</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="例如: 香草拿铁"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">售价 (¥)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">成本价 (¥)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.cost || ''}
                    onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.category || ''}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  list="categories"
                />
                <datalist id="categories">
                  <option value="咖啡" />
                  <option value="食品" />
                  <option value="饮品" />
                  <option value="周边" />
                </datalist>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">颜色标记</label>
                 <div className="flex gap-2 items-center">
                   <input 
                    type="color" 
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                    className="h-10 w-full rounded cursor-pointer border border-slate-200"
                   />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-slate-800 font-medium"
                >
                  保存商品
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">商品</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">分类</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">售价</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">成本</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full shadow-sm" 
                      style={{ backgroundColor: product.color }}
                    />
                    <span className="font-medium text-slate-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{product.category}</td>
                <td className="px-6 py-4 font-medium text-slate-900">¥{product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-500">¥{product.cost.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
             <div className="flex items-center gap-3">
               <div 
                  className="w-10 h-10 rounded-full shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: product.color }}
                />
               <div>
                 <h3 className="font-bold text-slate-800">{product.name}</h3>
                 <p className="text-xs text-slate-500">{product.category} | 成本: ¥{product.cost}</p>
               </div>
             </div>
             <div className="flex flex-col items-end gap-2">
               <span className="font-bold text-primary">¥{product.price.toFixed(2)}</span>
               <div className="flex gap-1">
                 <button 
                   onClick={() => handleEdit(product)}
                   className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"
                 >
                   <Edit2 className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => handleDelete(product.id)}
                   className="p-1.5 bg-red-50 text-red-600 rounded-lg"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;