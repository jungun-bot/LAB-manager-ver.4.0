
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InventoryList from './components/InventoryList';
import AIInsight from './components/AIInsight';
import AddItemModal from './components/AddItemModal';
import CellStockChart from './components/CellStockChart';
import OrderNeededList from './components/OrderNeededList';
import AuthScreen from './components/AuthScreen';
import LabSettingsModal from './components/LabSettingsModal';
import ApiKeyModal from './components/ApiKeyModal';
import { InventoryItem, Category, AIAnalysisResult, User } from './types';
import { analyzeInventoryWithGemini } from './services/geminiService';
import { Plus, Menu, LogOut, Settings, Key } from 'lucide-react';

// Sample Initial Data
const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: 'HeLa', category: Category.CELL_STOCK, quantity: 12, unit: 'vials', location: 'LN2 Tank 1', passage: 4, freezeDate: '2023-10-15', cellLineType: 'Adherent', notes: 'Master Bank' },
  { id: '1b', name: 'HeLa', category: Category.CELL_STOCK, quantity: 8, unit: 'vials', location: 'LN2 Tank 1', passage: 15, freezeDate: '2024-01-20', cellLineType: 'Adherent', notes: 'Working Bank' },
  { id: '2', name: 'DMEM High Glucose', category: Category.MEDIA, quantity: 1, unit: 'bottles', location: '4C Fridge', expiryDate: '2024-02-01', notes: 'Use for general culture. Order form Merck.' },
  { id: '3', name: 'FBS', category: Category.MEDIA, quantity: 2, unit: 'bottles', location: '-20C Freezer', expiryDate: '2025-01-20' },
  { id: '4', name: 'Trypsin-EDTA', category: Category.REAGENT, quantity: 5, unit: 'bottles', location: '4C Fridge', expiryDate: '2024-06-15', lotNumber: 'TR12345' },
  { id: '5', name: 'CHO-K1', category: Category.CELL_STOCK, quantity: 20, unit: 'vials', location: 'LN2 Tank 2', passage: 12, freezeDate: '2022-11-05', cellLineType: 'Adherent' },
  { id: '6', name: 'Pen-Strep', category: Category.REAGENT, quantity: 0, unit: 'aliquots', location: '-20C Freezer', expiryDate: '2024-08-01', notes: 'Urgent! Experiments paused.' },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use localStorage for items persistence in this demo, fallback to INITIAL_ITEMS
  const [items, setItems] = useState<InventoryItem[]>(() => {
      const saved = localStorage.getItem('lab_mgr_inventory');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('lab_mgr_inventory', JSON.stringify(items));
  }, [items]);

  // Auth Persistence Check
  useEffect(() => {
    const sessionUser = localStorage.getItem('lab_mgr_session');
    if (sessionUser) {
        setUser(JSON.parse(sessionUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      localStorage.setItem('lab_mgr_session', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('lab_mgr_session');
      setActiveTab('dashboard');
  };

  const handleSaveItem = (item: InventoryItem) => {
    if (editingItem) {
        // Update existing item
        setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
        // Add new item
        setItems(prev => [item, ...prev]);
    }
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
        setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ));
  };

  const handleToggleOrdered = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isOrdered: !item.isOrdered } : item
    ));
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    const result = await analyzeInventoryWithGemini(items);
    setAiResult(result);
    setAiLoading(false);
  };

  const getTabLabelKr = (tab: string) => {
    switch (tab) {
        case 'dashboard': return '실험실 현황';
        case 'cells': return '세포 재고 관리';
        case 'media': return '배지 관리';
        case 'reagents': return '시약 관리';
        default: return tab;
    }
  };

  // If not logged in, show Auth Screen
  if (!user) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  // Compute Stats
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.quantity <= 2).length;
  const expiredCount = items.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date()).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
      />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-64 bg-white h-full" onClick={e => e.stopPropagation()}>
             <div className="p-4 font-bold text-indigo-600 border-b border-gray-100 mb-2">LAB Mgr.</div>
             <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className="block w-full text-left p-4 hover:bg-gray-100">대시보드</button>
             <button onClick={() => { setActiveTab('cells'); setIsSidebarOpen(false); }} className="block w-full text-left p-4 hover:bg-gray-100">세포 재고</button>
             <button onClick={() => { setActiveTab('media'); setIsSidebarOpen(false); }} className="block w-full text-left p-4 hover:bg-gray-100">배지</button>
             
             <div className="border-t border-gray-100 mt-4 pt-4 px-4 space-y-2">
                 <button onClick={() => { setIsApiKeyModalOpen(true); setIsSidebarOpen(false); }} className="flex items-center gap-2 text-gray-600 py-2">
                    <Key size={18} /> API 키 설정
                 </button>
                 {user.isAdmin && (
                    <button onClick={() => { setIsSettingsModalOpen(true); setIsSidebarOpen(false); }} className="flex items-center gap-2 text-gray-600 py-2">
                        <Settings size={18} /> 관리자 설정
                    </button>
                 )}
                 <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 py-2">
                    <LogOut size={18} /> 로그아웃
                 </button>
             </div>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 bg-white rounded-lg border border-gray-200" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={20} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                    {getTabLabelKr(activeTab)}
                </h2>
                <p className="text-sm text-gray-500">안녕하세요, {user.name} 연구원님. 오늘도 안전한 실험 되세요.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">항목 추가</span>
          </button>
        </header>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">총 재고 항목</div>
                <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">재고 부족 알림</div>
                <div className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                    {lowStockCount}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">유효기간 만료</div>
                <div className={`text-3xl font-bold ${expiredCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {expiredCount}
                </div>
              </div>
            </div>

            {/* Charts & AI Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Cell Stock Chart */}
                    <CellStockChart items={items} />

                    {/* Order List */}
                    <div className="lg:hidden">
                         <OrderNeededList items={items} onToggleOrdered={handleToggleOrdered} />
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <AIInsight loading={aiLoading} analysis={aiResult} onAnalyze={handleAnalyze} />
                    <div className="hidden lg:block h-full">
                         <OrderNeededList items={items} onToggleOrdered={handleToggleOrdered} />
                    </div>
                </div>
            </div>

            {/* Recent Inventory (Flat List) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">최신 재고 목록</h3>
                </div>
                <div className="h-[400px] overflow-hidden">
                    <InventoryList items={items} onDelete={handleDeleteItem} onUpdateQuantity={handleUpdateQuantity} onEdit={handleEditClick} />
                </div>
            </div>
          </div>
        )}

        {/* Category Views */}
        {activeTab === 'cells' && (
            <InventoryList items={items} categoryFilter={Category.CELL_STOCK} onDelete={handleDeleteItem} onUpdateQuantity={handleUpdateQuantity} onEdit={handleEditClick} />
        )}
        {activeTab === 'media' && (
            <InventoryList items={items} categoryFilter={Category.MEDIA} onDelete={handleDeleteItem} onUpdateQuantity={handleUpdateQuantity} onEdit={handleEditClick} />
        )}
        {activeTab === 'reagents' && (
            <InventoryList items={items} categoryFilter={Category.REAGENT} onDelete={handleDeleteItem} onUpdateQuantity={handleUpdateQuantity} onEdit={handleEditClick} />
        )}

      </main>

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveItem} 
        initialData={editingItem}
      />
      
      <LabSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}

export default App;
