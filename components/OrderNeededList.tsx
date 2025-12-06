import React, { useState } from 'react';
import { InventoryItem, Category } from '../types';
import { AlertCircle, ShoppingCart, StickyNote, Check, Copy } from 'lucide-react';

interface OrderNeededListProps {
  items: InventoryItem[];
  onToggleOrdered: (id: string) => void;
}

const OrderNeededList: React.FC<OrderNeededListProps> = ({ items, onToggleOrdered }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const lowStockItems = items.filter(item => item.quantity <= 2); // Threshold logic

  const handleCopyNote = (note: string) => {
    navigator.clipboard.writeText(note);
  };

  const grouped = lowStockItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<Category, InventoryItem[]>);

  const getCategoryNameKr = (cat: Category) => {
      switch (cat) {
          case Category.CELL_STOCK: return '세포 재고';
          case Category.MEDIA: return '배지';
          case Category.REAGENT: return '시약';
          default: return cat;
      }
  };

  if (lowStockItems.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
        <div className="bg-green-100 p-3 rounded-full mb-3">
            <ShoppingCart className="text-green-600 w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900">재고 상태 양호</h3>
        <p className="text-sm text-gray-500 mt-1">현재 주문이 필요한 항목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-red-100 p-2 rounded-lg">
            <AlertCircle className="text-red-600 w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900">주문 필요</h3>
        <span className="text-xs text-gray-400 font-normal ml-auto">항목 클릭하여 상세 보기</span>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(grouped).map(([cat, items]) => {
          const catItems = items as InventoryItem[];
          return (
          <div key={cat} className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10 py-1">
                {getCategoryNameKr(cat as Category)}
            </h4>
            {catItems.map(item => {
              const isExpanded = expandedId === item.id;
              const isOrdered = item.isOrdered;
              
              return (
                <div 
                    key={item.id} 
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className={`rounded-lg border transition-all cursor-pointer overflow-hidden ${
                        isOrdered 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-100 hover:border-gray-300'
                    }`}
                >
                    <div className="flex justify-between items-center p-3">
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate flex items-center gap-2 ${isOrdered ? 'text-blue-900' : 'text-gray-800'}`}>
                                {item.name}
                                {isOrdered && <Check size={14} className="text-blue-500" />}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{item.location}</div>
                        </div>
                        <div className="text-right pl-2">
                            <span className={`font-bold text-sm block ${isOrdered ? 'text-blue-600' : 'text-red-600'}`}>
                                {item.quantity} {item.unit}
                            </span>
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <div className={`px-3 pb-3 pt-0 border-t border-dashed ${isOrdered ? 'border-blue-200' : 'border-gray-200'}`}>
                            <div className="mt-3 bg-white/60 rounded p-2 text-xs text-gray-600 mb-3 relative group">
                                <div className="flex items-center gap-1 font-semibold text-gray-400 mb-1 uppercase text-[10px]">
                                    <StickyNote size={10} /> 메모
                                </div>
                                {item.notes ? (
                                    <div className="flex justify-between items-start gap-2">
                                        <span>{item.notes}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleCopyNote(item.notes || ''); }}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                                            title="메모 복사"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">저장된 메모가 없습니다.</span>
                                )}
                            </div>
                            
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleOrdered(item.id);
                                }}
                                className={`w-full py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                                    isOrdered
                                        ? 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                }`}
                            >
                                {isOrdered ? (
                                    <>주문 취소 (미완료 상태로 변경)</>
                                ) : (
                                    <><Check size={14} /> 주문 완료 표시</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
              );
            })}
          </div>
        )})}
      </div>
    </div>
  );
};

export default OrderNeededList;