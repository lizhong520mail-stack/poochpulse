
import React, { useState, useEffect, useRef } from 'react';
import { HealthReport, AnalysisStatus, DogProfile } from './types';
import { analyzeStoolImage } from './services/deepseekService';
import Camera from './components/Camera';
import HistoryChart from './components/HistoryChart';
import ReportDetail from './components/ReportDetail';
import CalendarView from './components/CalendarView';
import DogSelector from './components/DogSelector';
import DailySummaryCard from './components/DailySummaryCard';
import KnowledgeBase from './components/KnowledgeBase';

const INITIAL_DOG: DogProfile = {
  id: 'default-dog',
  name: "旺财",
  breed: "金毛寻回犬",
  avatarSeed: "旺财",
  birthDate: "2020-01-01",
  weight: "25"
};

const App: React.FC = () => {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [dogs, setDogs] = useState<DogProfile[]>([INITIAL_DOG]);
  const [activeDogId, setActiveDogId] = useState<string>(INITIAL_DOG.id);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  
  // 网络与代理设置
  const [proxyUrl, setProxyUrl] = useState<string>(localStorage.getItem('pooch_proxy_url') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDogSelectorOpen, setIsDogSelectorOpen] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState<HealthReport | null>(null);
  
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDog = dogs.find(d => d.id === activeDogId) || dogs[0];
  const activeReports = reports.filter(r => r.dogId === activeDogId);

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkApiKey();

    const savedReports = localStorage.getItem('pooch_reports_v2');
    const savedDogs = localStorage.getItem('pooch_dogs_v2');
    const savedActiveId = localStorage.getItem('pooch_active_dog_id');
    
    if (savedReports) setReports(JSON.parse(savedReports));
    if (savedDogs) setDogs(JSON.parse(savedDogs));
    if (savedActiveId) setActiveDogId(savedActiveId);
  }, []);

  useEffect(() => {
    localStorage.setItem('pooch_reports_v2', JSON.stringify(reports));
    localStorage.setItem('pooch_dogs_v2', JSON.stringify(dogs));
    localStorage.setItem('pooch_active_dog_id', activeDogId);
    localStorage.setItem('pooch_proxy_url', proxyUrl);
  }, [reports, dogs, activeDogId, proxyUrl]);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasApiKey(true);
  };

  const processImageAnalysis = async (imageData: string) => {
    setStatus(AnalysisStatus.LOADING);
    try {
      const newReport = await analyzeStoolImage(imageData, activeDogId, proxyUrl);
      setReports(prev => [newReport, ...prev]);
      setShowDailySummary(newReport);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setStatus(AnalysisStatus.ERROR);
      
      const errorMsg = error.message || "";
      if (
        errorMsg === "API_KEY_MISSING" || 
        errorMsg === "INVALID_KEY_ERROR" || 
        errorMsg.includes("API Key must be set")
      ) {
        alert("AI 引擎授权失效。如果你在中国境内使用，请点击右上角设置图标配置 API 代理地址。");
        setHasApiKey(false);
      } else {
        alert(`分析失败: ${errorMsg}\n提示：请检查网络或是否需要配置代理。`);
      }
    } finally {
      setTimeout(() => setStatus(AnalysisStatus.IDLE), 3000);
    }
  };

  const handleCapture = (imageData: string) => {
    setIsCameraOpen(false);
    processImageAnalysis(imageData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processImageAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addDog = (dogData: Omit<DogProfile, 'id'>) => {
    const newDog: DogProfile = { ...dogData, id: Date.now().toString() };
    setDogs(prev => [...prev, newDog]);
    setActiveDogId(newDog.id);
  };

  const updateDog = (updatedDog: DogProfile) => {
    setDogs(prev => prev.map(d => d.id === updatedDog.id ? updatedDog : d));
  };

  const getActiveAvatar = () => {
    if (activeDog.customAvatarUrl) {
      return <img src={activeDog.customAvatarUrl} alt={activeDog.name} className="w-full h-full object-cover" />;
    }
    return <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${activeDog.avatarSeed}`} alt={activeDog.name} className="w-full h-full object-cover" />;
  };

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-500/20">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 5.172a2 2 0 0 0-1.414.586L3.828 10.5a2 2 0 0 0 0 2.828l4.758 4.758a2 2 0 0 0 2.828 0l4.758-4.758a2 2 0 0 0 0-2.828L11.414 5.758a2 2 0 0 0-1.414-.586ZM14.5 4a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0ZM18.5 9a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0ZM7 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">PoochPulse</h1>
        <p className="text-slate-400 max-w-xs mb-10 leading-relaxed">
          检测到 AI 引擎尚未激活。请点击下方按钮。
        </p>
        <div className="space-y-4 w-full max-w-xs">
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95"
          >
            立即激活 AI 引擎
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
          >
            网络设置 (代理配置)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 5.172a2 2 0 0 0-1.414.586L3.828 10.5a2 2 0 0 0 0 2.828l4.758 4.758a2 2 0 0 0 2.828 0l4.758-4.758a2 2 0 0 0 0-2.828L11.414 5.758a2 2 0 0 0-1.414-.586ZM14.5 4a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0ZM18.5 9a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0ZM7 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight">PoochPulse</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Smart Health AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          
          <button 
            onClick={() => setIsCalendarOpen(prev => !prev)}
            className={`p-2.5 rounded-xl transition-all active:scale-90 ${isCalendarOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </button>
          
          <button 
            onClick={() => setIsDogSelectorOpen(true)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 pl-1 pr-3 py-1 rounded-full transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-200 overflow-hidden shadow-sm">
              {getActiveAvatar()}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-indigo-700">{activeDog.name}</span>
            </div>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-12">
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 group">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">智能影像分析</h3>
            <p className="text-indigo-100 text-sm mb-8 max-w-[200px] leading-relaxed font-medium opacity-90">无论是即时拍摄还是相册图片，AI 都能精准评估。</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsCameraOpen(true)}
                className="flex-1 px-6 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:shadow-white/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                拍照分析
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-6 py-4 bg-indigo-500/20 backdrop-blur border border-white/30 text-white rounded-2xl font-black shadow-lg hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                相册上传
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
            </div>
          </div>
        </section>

        {activeReports.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <HistoryChart reports={activeReports} />
          </section>
        )}

        <KnowledgeBase />
      </main>

      {/* 设置弹窗 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">网络与代理</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API 代理地址 (可选)</label>
                <input 
                  type="text"
                  placeholder="如: https://api.xxx.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all"
                  value={proxyUrl}
                  onChange={e => setProxyUrl(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  提示：如果你在中国境内使用且没有开启 VPN，请填写一个有效的 AI 代理地址。留空则默认连接 DeepSeek 官方接口。
                </p>
              </div>
              
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {status === AnalysisStatus.LOADING && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">AI 正在深度扫描...</h3>
            <p className="text-slate-500 font-medium">我们正在分析便便的质地与颜色。</p>
          </div>
        </div>
      )}

      {isCameraOpen && <Camera onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
      {selectedReport && <ReportDetail report={selectedReport} onClose={() => setSelectedReport(null)} />}
      {isCalendarOpen && <CalendarView reports={activeReports} onClose={() => setIsCalendarOpen(false)} onSelectReport={setSelectedReport} onDeleteReport={(id) => setReports(prev => prev.filter(r => r.id !== id))} />}
      {isDogSelectorOpen && <DogSelector dogs={dogs} activeDogId={activeDogId} onSelect={setActiveDogId} onAdd={addDog} onUpdate={updateDog} onClose={() => setIsDogSelectorOpen(false)} />}
      {showDailySummary && <DailySummaryCard report={showDailySummary} dogName={activeDog.name} onClose={() => setShowDailySummary(null)} onViewDetail={() => setSelectedReport(showDailySummary)} />}
    </div>
  );
};

export default App;
