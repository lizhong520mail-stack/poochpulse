
import React from 'react';

const KNOWLEDGE_ITEMS = [
  {
    title: "理想的便便 (2分)",
    description: "呈现巧克力棕色，坚实但有弹性，像木头一样成型，捡起时不留痕迹。",
    icon: "✨",
    color: "bg-emerald-50",
    textColor: "text-emerald-700"
  },
  {
    title: "颜色背后的秘密",
    description: "黑色可能预示上消化道出血；绿色可能与摄入过多草或胆汁有关；红色血丝需警惕结肠问题。",
    icon: "🎨",
    color: "bg-amber-50",
    textColor: "text-amber-700"
  },
  {
    title: "什么是普瑞纳评分？",
    description: "全球通用的 1-7 分制。1分干硬，2-3分理想，4-5分软便，6-7分腹泻。",
    icon: "📊",
    color: "bg-indigo-50",
    textColor: "text-indigo-700"
  },
  {
    title: "何时需要看兽医？",
    description: "如果便便中出现大量粘液、寄生虫、异物，或者狗狗伴有呕吐、食欲不振等症状。",
    icon: "🏥",
    color: "bg-red-50",
    textColor: "text-red-700"
  }
];

const KnowledgeBase: React.FC = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
          犬类便便科普
        </h3>
        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
          AI 学习中心
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {KNOWLEDGE_ITEMS.map((item, index) => (
          <div 
            key={index} 
            className={`p-5 rounded-[2rem] ${item.color} border border-white/50 shadow-sm flex gap-4 transition-transform active:scale-[0.98]`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">
              {item.icon}
            </div>
            <div className="space-y-1">
              <h4 className={`font-black text-sm ${item.textColor}`}>{item.title}</h4>
              <p className="text-xs leading-relaxed opacity-80 font-medium text-slate-600">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">小贴士</p>
          <p className="text-sm font-medium leading-relaxed italic opacity-90">
            “记录比记忆更可靠。每天坚持打卡，能帮助兽医更快锁定病因。”
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
           <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeBase;
