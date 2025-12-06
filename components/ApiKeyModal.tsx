
import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { saveApiKey, getApiKey, removeApiKey } from '../utils/secureStorage';
import { testGeminiConnection } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = getApiKey();
      setApiKey(storedKey || '');
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setStatus('error');
      setMessage('API 키를 입력해주세요.');
      return;
    }

    setStatus('testing');
    const isValid = await testGeminiConnection(apiKey);

    if (isValid) {
      const saved = saveApiKey(apiKey);
      if (saved) {
        setStatus('success');
        setMessage('연결 성공! API 키가 안전하게 암호화되어 저장되었습니다.');
        setTimeout(() => onClose(), 2000);
      } else {
        setStatus('error');
        setMessage('저장 실패: 로컬 스토리지를 사용할 수 없습니다.');
      }
    } else {
      setStatus('error');
      setMessage('연결 실패: 유효하지 않은 API 키입니다.');
    }
  };

  const handleClear = () => {
    if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
        removeApiKey();
        setApiKey('');
        setStatus('idle');
        setMessage('API 키가 삭제되었습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Key size={20} className="text-indigo-600" />
            API 키 설정
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} className="p-6 space-y-4">
          <div className="text-sm text-gray-600 bg-indigo-50 p-4 rounded-lg">
             Google Gemini API 키를 입력하세요. 키는 <strong>암호화되어 로컬 드라이브에만 저장</strong>되며, 서버로 전송되지 않습니다.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">API Key</label>
            <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                    setApiKey(e.target.value);
                    setStatus('idle');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                placeholder="AIza..."
            />
          </div>

          {status !== 'idle' && (
            <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${
                status === 'testing' ? 'bg-blue-50 text-blue-700' :
                status === 'success' ? 'bg-green-50 text-green-700' :
                'bg-red-50 text-red-700'
            }`}>
                {status === 'testing' && <Loader2 size={16} className="animate-spin" />}
                {status === 'success' && <CheckCircle size={16} />}
                {status === 'error' && <AlertTriangle size={16} />}
                {status === 'testing' ? '연결 테스트 중...' : message}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button 
                type="button"
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
                키 삭제
            </button>
            <button 
                type="submit" 
                disabled={status === 'testing'}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {status === 'testing' ? '확인 중...' : '저장 및 연결 테스트'}
            </button>
          </div>
          
          <div className="text-xs text-center text-gray-400 mt-2">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-indigo-500">
                Google AI Studio에서 키 발급받기
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
