import React, { useState, useEffect } from 'react';
import { InventoryItem, Category } from '../types';
import { X } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  initialData: InventoryItem | null;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [category, setCategory] = useState<Category>(Category.CELL_STOCK);
  
  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('vials');
  const [location, setLocation] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Specifics
  const [passage, setPassage] = useState('');
  const [freezeDate, setFreezeDate] = useState('');
  const [cellLineType, setCellLineType] = useState('Adherent');
  const [lotNumber, setLotNumber] = useState('');

  // Populate form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category);
        setName(initialData.name);
        setQuantity(initialData.quantity.toString());
        setUnit(initialData.unit);
        setLocation(initialData.location);
        setNotes(initialData.notes || '');
        setExpiryDate(initialData.expiryDate || '');
        
        // Category specific
        if (initialData.category === Category.CELL_STOCK) {
          setPassage(initialData.passage?.toString() || '');
          setFreezeDate(initialData.freezeDate || '');
          setCellLineType(initialData.cellLineType || 'Adherent');
        }
        
        if (initialData.category === Category.REAGENT) {
          setLotNumber(initialData.lotNumber || '');
        }
      } else {
        // Reset to defaults for new item
        setCategory(Category.CELL_STOCK);
        setName('');
        setQuantity('');
        setUnit('vials');
        setLocation('');
        setNotes('');
        setExpiryDate('');
        setPassage('');
        setFreezeDate('');
        setCellLineType('Adherent');
        setLotNumber('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: initialData ? initialData.id : Date.now().toString(), // Keep ID if editing
      name,
      category,
      quantity: Number(quantity),
      unit,
      location,
      notes: notes || undefined,
      expiryDate: expiryDate || undefined,
      lotNumber: lotNumber || undefined,
      passage: category === Category.CELL_STOCK ? Number(passage) : undefined,
      freezeDate: category === Category.CELL_STOCK ? freezeDate : undefined,
      cellLineType: category === Category.CELL_STOCK ? cellLineType : undefined,
      isOrdered: initialData ? initialData.isOrdered : false, // Preserve order status
    };
    onSave(newItem);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? '항목 수정' : '새 항목 추가'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Category Selector - Only editable if adding new item to avoid data structure issues */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  disabled={!!initialData} // Disable category switching during edit
                  onClick={() => {
                    setCategory(cat);
                    setUnit(cat === Category.CELL_STOCK ? 'vials' : cat === Category.MEDIA ? 'bottles' : 'units');
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg border ${
                    category === cat
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  } ${!!initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {getCategoryNameKr(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">품명 (Item Name)</label>
            <input 
              required 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder={category === Category.CELL_STOCK ? "예: HeLa" : "예: DMEM High Glucose"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
              <input 
                required 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">단위 (Unit)</label>
              <input 
                type="text" 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">보관 위치</label>
            <input 
              required 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              placeholder="예: Rack A, Shelf 2"
            />
          </div>

          {/* Conditional Fields: Cell Stock */}
          {category === Category.CELL_STOCK && (
            <div className="bg-purple-50 p-4 rounded-lg space-y-3 border border-purple-100">
              <h3 className="text-xs font-bold text-purple-800 uppercase">세포주 상세 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-purple-900 mb-1">Passage #</label>
                  <input 
                    type="number" 
                    value={passage} 
                    onChange={(e) => setPassage(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded bg-white text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-900 mb-1">동결일 (Freeze Date)</label>
                  <input 
                    type="date" 
                    value={freezeDate} 
                    onChange={(e) => setFreezeDate(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded bg-white text-sm" 
                  />
                </div>
              </div>
              <div>
                  <label className="block text-xs font-medium text-purple-900 mb-1">세포 유형</label>
                  <select 
                    value={cellLineType} 
                    onChange={(e) => setCellLineType(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded bg-white text-sm"
                  >
                    <option value="Adherent">Adherent (부착형)</option>
                    <option value="Suspension">Suspension (부유형)</option>
                    <option value="Primary">Primary (일차세포)</option>
                  </select>
              </div>
            </div>
          )}

          {/* Conditional Fields: Media/Reagent */}
          {(category === Category.MEDIA || category === Category.REAGENT) && (
             <div className="space-y-3">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유효기간 (Expiry Date)</label>
                  <input 
                    type="date" 
                    value={expiryDate} 
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                  />
               </div>
               {category === Category.REAGENT && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot 번호</label>
                    <input 
                      type="text" 
                      value={lotNumber} 
                      onChange={(e) => setLotNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                    />
                 </div>
               )}
             </div>
          )}

          {/* Notes - Available for all */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모 (Notes)</label>
            <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="관련 메모를 입력하세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
            >
              {initialData ? '저장' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;