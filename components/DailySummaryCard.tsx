
import React from 'react';
import { HealthReport } from '../types';

interface DailySummaryCardProps {
  report: HealthReport;
  dogName: string;
  onClose: () => void;
  onViewDetail: () => void;
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ report, dogName, onClose, onViewDetail }) => {
  const isHealthy = report.score >= 2 && report.score <= 3;
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-6 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto animate-in slide-in-from-bottom-full duration-500 ease-out">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">今日健康快报</h3>
                <p className="text-slate-500 font-medium">{dogName} 的最新分析已完成</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className={`flex items-center gap-6 p-6 rounded-[2rem] ${isHealthy ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {isHealthy ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m12 19 9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                )}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">健康状态</p>
                <p className="text-xl font-black">{isHealthy ? '状态极佳' : '建议关注'}</p>
                <p className="text-sm font-medium opacity-80 mt-1">{report.consistency}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => { onViewDetail(); onClose(); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                查看详细报告
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                分析时间：{new Date(report.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryCard;
