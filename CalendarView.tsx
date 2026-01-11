
import React, { useState } from 'react';
import { HealthReport } from '../types';

interface CalendarViewProps {
  reports: HealthReport[];
  onClose: () => void;
  onSelectReport: (report: HealthReport) => void;
  onDeleteReport: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ reports, onClose, onSelectReport, onDeleteReport }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  const days = Array.from({ length: numDays }, (_, i) => i + 1);
  const blanks = Array.from({ length: offset }, (_, i) => i);

  const reportsByDate = reports.reduce((acc, report) => {
    const dateStr = report.date.split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(report);
    return acc;
  }, {} as Record<string, HealthReport[]>);

  const filteredReports = selectedDate ? reportsByDate[selectedDate] || [] : [];

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col animate-in fade-in duration-300">
      <header className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
        <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-lg font-bold text-slate-900">健康日志</h2>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Calendar Grid */}
        <div className="p-6 bg-slate-50 border-b">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-indigo-600">
              {year}年 {month + 1}月
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button onClick={nextMonth} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-xs font-bold text-slate-400 uppercase py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {blanks.map(i => <div key={`blank-${i}`} />)}
            {days.map(day => {
              const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasReports = reportsByDate[dStr];
              const isSelected = selectedDate === dStr;
              const isToday = new Date().toISOString().split('T')[0] === dStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dStr)}
                  className={`
                    relative h-12 flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all
                    ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-indigo-50'}
                    ${isToday && !isSelected ? 'border-2 border-indigo-200' : ''}
                  `}
                >
                  {day}
                  {hasReports && (
                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Reports */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-slate-900">
              {selectedDate ? `${selectedDate.split('-')[1]}月${selectedDate.split('-')[2]}日` : '选择日期'} 的记录
            </h4>
            <span className="text-xs font-bold text-slate-400">{filteredReports.length} 条</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm italic">
              这天没有记录哦
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map(report => (
                <div 
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
                >
                  <img src={report.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(report.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm("删除记录？")) onDeleteReport(report.id);
                        }}
                        className="text-slate-300 hover:text-red-400 p-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${report.score === 2 ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <p className="text-sm font-bold text-slate-700 truncate">{report.consistency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
