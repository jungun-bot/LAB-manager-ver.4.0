import React from 'react';
import { LayoutDashboard, FlaskConical, Dna, FileDigit, Settings, LogOut, Shield } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, onOpenSettings }) => {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'cells', label: '세포 재고', icon: Dna },
    { id: 'media', label: '세포 배지', icon: FlaskConical },
    { id: 'reagents', label: '실험 시약', icon: FileDigit },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <FlaskConical className="w-8 h-8" />
          LAB Mgr.
        </h1>
        {user && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                {user.isAdmin && <Shield size={12} className="text-indigo-500" />}
                <span>{user.name} 연구원</span>
            </div>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        {user?.isAdmin && (
            <button 
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
                <Settings size={20} />
                <span className="text-sm font-medium">관리자 설정</span>
            </button>
        )}
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;