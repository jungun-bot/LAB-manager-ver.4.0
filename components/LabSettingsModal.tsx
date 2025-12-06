import React, { useState, useEffect } from 'react';
import { X, KeyRound, ShieldCheck } from 'lucide-react';

interface LabSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LabSettingsModal: React.FC<LabSettingsModalProps> = ({ isOpen, onClose }) => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isOpen) {
      setCurrentCode(localStorage.getItem('lab_mgr_code') || 'LAB1234');
      setNewCode('');
      setConfirmCode('');
      setMessage({ text: '', type: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.length < 4) {
      setMessage({ text: '코드는 4자리 이상이어야 합니다.', type: 'error' });
      return;
    }
    if (newCode !== confirmCode) {
      setMessage({ text: '새 코드가 일치하지 않습니다.', type: 'error' });
      return;
    }

    localStorage.setItem('lab_mgr_code', newCode);
    setMessage({ text: '실험실 코드가 성공적으로 변경되었습니다.', type: 'success' });
    setTimeout(() => {
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-600" />
            실험실 보안 설정
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
             새로운 구성원이 가입할 때 사용할 <br/><strong>실험실 비밀번호(Lab Code)</strong>를 설정합니다.
          </div>

          <div>
             <label className="block text-xs font-semibold text-gray-500 mb-1">현재 코드</label>
             <input type="text" value={currentCode} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-500 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">새로운 코드</label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    required
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="새 코드 입력"
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">코드 확인</label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    required
                    type="text"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="새 코드 재입력"
                />
            </div>
          </div>

          {message.text && (
            <div className={`text-xs p-2 rounded text-center ${message.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors mt-2"
          >
            설정 저장
          </button>
        </form>
      </div>
    </div>
  );
};

export default LabSettingsModal;