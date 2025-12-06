import React, { useState, useEffect } from 'react';
import { FlaskConical, Lock, User, KeyRound, ShieldAlert } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isAdminSignup, setIsAdminSignup] = useState(false); // Hidden mode
  
  // Form State
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [labCode, setLabCode] = useState('');
  const [error, setError] = useState('');

  // Hidden Trigger State
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    // Reset admin signup if switching tabs
    if (isLoginMode) {
      setIsAdminSignup(false);
      setLogoClicks(0);
    }
  }, [isLoginMode]);

  const handleLogoClick = () => {
    if (isLoginMode) return; // Only allow trigger on signup screen
    
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (newCount === 5) {
      setIsAdminSignup(true);
      setError('');
      alert("관리자 등록 모드가 활성화되었습니다.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storedUsersStr = localStorage.getItem('lab_mgr_users');
    const users: UserType[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];
    
    // Default Lab Code if not set
    const currentLabCode = localStorage.getItem('lab_mgr_code') || 'LAB1234';

    if (isLoginMode) {
      // LOGIN LOGIC
      const user = users.find(u => u.id === userId && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } else {
      // SIGNUP LOGIC
      if (users.find(u => u.id === userId)) {
        setError('이미 존재하는 아이디입니다.');
        return;
      }

      // Check Lab Code (skip if admin signup)
      if (!isAdminSignup && labCode !== currentLabCode) {
        setError('실험실 비밀번호(Lab Code)가 일치하지 않습니다.');
        return;
      }

      const newUser: UserType = {
        id: userId,
        password: password, // Note: In production, hash this!
        name: name,
        isAdmin: isAdminSignup
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('lab_mgr_users', JSON.stringify(updatedUsers));
      
      // If this is the first admin, ensure lab code is saved
      if (isAdminSignup && !localStorage.getItem('lab_mgr_code')) {
        localStorage.setItem('lab_mgr_code', 'LAB1234');
      }

      alert(isAdminSignup ? "관리자 계정이 생성되었습니다." : "회원가입이 완료되었습니다.");
      setIsLoginMode(true);
      setIsAdminSignup(false);
      setLogoClicks(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center relative">
          <div 
            onClick={handleLogoClick}
            className="inline-flex justify-center items-center w-16 h-16 bg-white/20 rounded-full mb-4 text-white backdrop-blur-sm cursor-pointer select-none active:scale-95 transition-transform"
          >
            {isAdminSignup ? <ShieldAlert size={32} /> : <FlaskConical size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">LAB Manager</h1>
          <p className="text-indigo-200 text-sm">스마트한 실험실 재고 관리 시스템</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              isLoginMode ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              !isLoginMode ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}

          {!isLoginMode && isAdminSignup && (
             <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-lg border border-amber-200 text-center font-bold">
               관리자 등록 모드 활성화됨
             </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="아이디를 입력하세요"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          {!isLoginMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">이름</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="연구원 이름"
                  />
                </div>
              </div>

              {!isAdminSignup && (
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">실험실 코드 (Lab Code)</label>
                    <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        required
                        type="password"
                        value={labCode}
                        onChange={(e) => setLabCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="실험실 보안 코드 입력"
                    />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 pl-1">* 실험실 관리자에게 문의하세요.</p>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-4"
          >
            {isLoginMode ? '로그인' : (isAdminSignup ? '관리자 등록' : '가입하기')}
          </button>
        </form>
      </div>
      
      {!isLoginMode && !isAdminSignup && (
        <div className="fixed bottom-4 text-gray-300 text-xs">
            Tip: 로고를 5번 클릭하면 관리자 등록이 가능합니다.
        </div>
      )}
    </div>
  );
};

export default AuthScreen;