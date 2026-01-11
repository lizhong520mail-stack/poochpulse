
import React from 'react';
import { HealthReport } from '../types';

interface ReportDetailProps {
  report: HealthReport;
  onClose: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score === 2) return 'bg-green-500';
    if (score >= 4 || score === 1) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getScoreText = (score: number) => {
    if (score === 2) return '理想 (Ideal)';
    if (score === 3) return '良好 (Good)';
    if (score === 1) return '干硬 (Constipated)';
    return '软便/腹泻 (Loose/Diarrhea)';
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="relative h-64 w-full">
          <img src={report.imageUrl} alt="Stool Analysis" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getScoreColor(report.score)}`}>
                分值: {report.score}
              </span>
              <span className="text-white/90 text-sm font-medium">{getScoreText(report.score)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">颜色</p>
              <p className="font-semibold text-slate-900">{report.color}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">质地</p>
              <p className="font-semibold text-slate-900">{report.consistency}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              AI 分析
            </h4>
            <p className="text-slate-600 leading-relaxed text-sm">
              {report.analysis}
            </p>
          </div>

          {report.findings.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">显著发现</h4>
              <div className="flex flex-wrap gap-2">
                {report.findings.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              健康建议
            </h4>
            <p className="text-indigo-800 text-sm leading-relaxed">
              {report.recommendation}
            </p>
          </div>

          <div className="p-3 bg-red-50 rounded-lg text-[10px] text-red-600 leading-tight">
            <strong>免责声明：</strong> 本分析由 AI 生成，仅供参考。AI 无法替代专业兽医诊断。如果您的宠物表现出精神萎靡、呕吐或持续腹泻，请立即咨询兽医。
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
