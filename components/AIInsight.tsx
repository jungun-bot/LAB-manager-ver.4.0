import React from 'react';
import { AIAnalysisResult } from '../types';
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AIInsightProps {
  loading: boolean;
  analysis: AIAnalysisResult | null;
  onAnalyze: () => void;
}

const AIInsight: React.FC<AIInsightProps> = ({ loading, analysis, onAnalyze }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
      <div className="p-5 border-b border-indigo-50 bg-indigo-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI 실험실 비서
        </h3>
        <button
          onClick={onAnalyze}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            loading
              ? 'bg-indigo-100 text-indigo-400 cursor-wait'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? '분석 중...' : '재고 분석 실행'}
        </button>
      </div>

      <div className="p-6">
        {!analysis && !loading && (
          <div className="text-center text-gray-500 py-8">
            <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>재고 분석을 시작할 준비가 되었습니다.</p>
            <p className="text-sm">버튼을 눌러 재고 수준과 유효기간 위험을 진단하세요.</p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-100 rounded-lg"></div>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">요약 보고서</h4>
              <p className="text-gray-700 leading-relaxed text-sm">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  알림 (Alerts)
                </h4>
                <ul className="space-y-2">
                  {analysis.alerts.map((alert, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-amber-900">
                      <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                        alert.severity === 'high' ? 'bg-red-500' : 
                        alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-400'
                      }`} />
                      {alert.message}
                    </li>
                  ))}
                  {analysis.alerts.length === 0 && <li className="text-sm text-amber-700 italic">중요한 알림이 없습니다.</li>}
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} />
                  제안 (Suggestions)
                </h4>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-emerald-900">
                      <Info size={14} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsight;