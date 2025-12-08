
import React, { useMemo, useState } from 'react';
import { InventoryItem, Category } from '../types';
import { Search, Droplet, Dna, FileBox, Trash2, Edit2, ChevronDown, ChevronRight, StickyNote, Plus, Minus, Copy } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  categoryFilter?: Category | 'ALL';
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onEdit: (item: InventoryItem) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, categoryFilter = 'ALL', onDelete, onUpdateQuantity, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCopyNote = (note: string) => {
    navigator.clipboard.writeText(note);
    // Optional: Could add a toast notification here
  };

  const filteredItems = useMemo(() => {
    let result = items;

    if (categoryFilter !== 'ALL') {
      result = result.filter(item => item.category === categoryFilter);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lower) || 
        item.location.toLowerCase().includes(lower) ||
        (item.lotNumber && item.lotNumber.toLowerCase().includes(lower))
      );
    }
    return result;
  }, [items, categoryFilter, searchTerm]);

  // Grouping Logic for Cell Stocks
  const groupedData = useMemo(() => {
    if (categoryFilter !== Category.CELL_STOCK) return null;

    const groups: Record<string, InventoryItem[]> = {};
    filteredItems.forEach(item => {
        if (!groups[item.name]) groups[item.name] = [];
        groups[item.name].push(item);
    });

    // Sort batches inside groups
    Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => {
            // Sort by passage (asc), then by date (desc)
            if (a.passage !== b.passage) return (a.passage || 0) - (b.passage || 0);
            return new Date(b.freezeDate || 0).getTime() - new Date(a.freezeDate || 0).getTime();
        });
    });

    return groups;
  }, [filteredItems, categoryFilter]);


  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case Category.CELL_STOCK: return <Dna className="text-purple-500" size={18} />;
      case Category.MEDIA: return <Droplet className="text-blue-500" size={18} />;
      case Category.REAGENT: return <FileBox className="text-orange-500" size={18} />;
    }
  };

  const getBadgeColor = (cat: Category) => {
    switch (cat) {
      case Category.CELL_STOCK: return 'bg-purple-100 text-purple-700';
      case Category.MEDIA: return 'bg-blue-100 text-blue-700';
      case Category.REAGENT: return 'bg-orange-100 text-orange-700';
    }
  };

  const getCategoryNameKr = (cat: Category) => {
      switch (cat) {
          case Category.CELL_STOCK: return '세포 재고';
          case Category.MEDIA: return '배지';
          case Category.REAGENT: return '시약';
          default: return cat;
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="재고 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="col-span-4 md:col-span-4">품명 (Item)</div>
        <div className="col-span-2 hidden md:block">카테고리</div>
        <div className="col-span-3 md:col-span-2">위치</div>
        <div className="col-span-3 md:col-span-2 text-center md:text-left">수량</div>
        <div className="col-span-2 md:col-span-1 text-right">관리</div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FileBox size={48} className="mb-2 opacity-20" />
            <p>항목이 없습니다.</p>
          </div>
        ) : (
          // Use Grouped View only if filtered by Cell Stock
          groupedData ? (
             Object.entries(groupedData).map(([name, rawItems]) => {
                const groupItems = rawItems as InventoryItem[];
                const totalQty = groupItems.reduce((sum, i) => sum + i.quantity, 0);
                const isExpanded = expandedGroups[name];
                
                return (
                    <div key={name} className="border-b border-gray-100">
                        {/* Parent Row */}
                        <div 
                            onClick={() => toggleGroup(name)}
                            className="grid grid-cols-12 gap-2 px-4 py-4 hover:bg-gray-50 cursor-pointer items-center"
                        >
                             <div className="col-span-4 md:col-span-4 flex items-center gap-2 truncate">
                                {isExpanded ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                                <span className="font-bold text-gray-900 truncate">{name}</span>
                                <span className="text-xs text-gray-500 hidden sm:inline">({groupItems.length} batches)</span>
                             </div>
                             <div className="col-span-2 hidden md:block">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${getBadgeColor(Category.CELL_STOCK)}`}>
                                    <Dna size={14} /> 세포 재고
                                </span>
                             </div>
                             <div className="col-span-3 md:col-span-2 text-sm text-gray-500 truncate">Mixed Loc.</div>
                             <div className="col-span-3 md:col-span-2 font-bold text-gray-900 text-center md:text-left">{totalQty} <span className="text-gray-400 font-normal text-xs">vials</span></div>
                             <div className="col-span-2 md:col-span-1"></div>
                        </div>

                        {/* Child Rows */}
                        {isExpanded && (
                            <div className="bg-gray-50/50 border-t border-gray-100">
                                {groupItems.map(item => (
                                    <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 pl-8 md:pl-12 text-sm border-b border-gray-100 last:border-0 hover:bg-white transition-colors items-center group">
                                        <div className="col-span-4 md:col-span-4 flex flex-col truncate">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="font-medium text-indigo-700 shrink-0">P{item.passage}</span>
                                                <span className="text-gray-400 text-xs shrink-0">•</span>
                                                <span className="text-gray-600 truncate">{item.freezeDate}</span>
                                            </div>
                                            {item.notes && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 truncate">
                                                    <StickyNote size={10} className="shrink-0" /> 
                                                    <span className="truncate">{item.notes}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleCopyNote(item.notes || ''); }}
                                                        className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 shrink-0"
                                                        title="메모 복사"
                                                    >
                                                        <Copy size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-2 hidden md:block text-xs text-gray-500 truncate">{item.cellLineType}</div>
                                        <div className="col-span-3 md:col-span-2 text-gray-600 truncate">{item.location}</div>
                                        
                                        {/* Qty with Controls */}
                                        <div className="col-span-3 md:col-span-2 flex items-center justify-center md:justify-start gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity - 1); }}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="font-medium text-gray-900 min-w-[20px] text-center">{item.quantity}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity + 1); }}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>

                                        <div className="col-span-2 md:col-span-1 flex justify-end gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                title="수정"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                title="삭제"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
             })
          ) : (
            // Standard Flat List (Media/Reagents)
            filteredItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center group">
                
                <div className="col-span-4 md:col-span-4 overflow-hidden">
                    <div className="font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                         {item.category === Category.REAGENT && item.lotNumber && (<span className="truncate">LOT: {item.lotNumber}</span>)}
                         {item.expiryDate && (
                            <span className={`truncate ${new Date(item.expiryDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                Exp: {item.expiryDate}
                            </span>
                         )}
                         {item.notes && (
                            <span className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded truncate max-w-full">
                                <StickyNote size={10} className="shrink-0" /> 
                                <span className="truncate">{item.notes}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCopyNote(item.notes || ''); }}
                                    className="ml-1 p-0.5 hover:bg-indigo-100 rounded text-indigo-400 hover:text-indigo-600 shrink-0"
                                    title="메모 복사"
                                >
                                    <Copy size={10} />
                                </button>
                            </span>
                         )}
                    </div>
                </div>

                <div className="col-span-2 hidden md:flex items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getBadgeColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                    {getCategoryNameKr(item.category)}
                    </span>
                </div>

                <div className="col-span-3 md:col-span-2 text-sm text-gray-600 truncate">
                    {item.location}
                </div>

                <div className="col-span-3 md:col-span-2 flex items-center justify-center md:justify-start gap-1 md:gap-2">
                     <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity - 1); }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                    >
                        <Minus size={12} />
                    </button>
                    <div className="min-w-[30px] flex flex-col md:flex-row items-center justify-center md:gap-1">
                        <span className="font-medium text-gray-900 leading-none">{item.quantity}</span>
                        <span className="text-[10px] text-gray-500 md:text-xs leading-none mt-0.5 md:mt-0">{item.unit}</span>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity + 1); }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <div className="col-span-2 md:col-span-1 flex justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        title="수정"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="삭제"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default InventoryList;
