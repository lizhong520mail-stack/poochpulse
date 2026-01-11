
import React, { useState, useRef } from 'react';
import { DogProfile } from '../types';

interface DogSelectorProps {
  dogs: DogProfile[];
  activeDogId: string;
  onSelect: (id: string) => void;
  onAdd: (dog: Omit<DogProfile, 'id'>) => void;
  onUpdate: (dog: DogProfile) => void;
  onClose: () => void;
}

const DogSelector: React.FC<DogSelectorProps> = ({ dogs, activeDogId, onSelect, onAdd, onUpdate, onClose }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingDog, setEditingDog] = useState<DogProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    weight: '',
    breed: '通用型',
    customAvatarUrl: '' as string | undefined
  });

  const resetForm = () => {
    setFormData({ name: '', birthDate: '', weight: '', breed: '通用型', customAvatarUrl: undefined });
    setShowAdd(false);
    setEditingDog(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, customAvatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingDog) {
      onUpdate({
        ...editingDog,
        ...formData,
        avatarSeed: formData.name
      });
    } else {
      onAdd({
        ...formData,
        avatarSeed: formData.name
      });
    }
    resetForm();
  };

  const startEdit = (dog: DogProfile) => {
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      birthDate: dog.birthDate || '',
      weight: dog.weight || '',
      breed: dog.breed || '通用型',
      customAvatarUrl: dog.customAvatarUrl
    });
    setShowAdd(true);
  };

  const renderAvatar = (dog: DogProfile | { avatarSeed: string, customAvatarUrl?: string, name: string }) => {
    if (dog.customAvatarUrl) {
      return <img src={dog.customAvatarUrl} alt={dog.name} className="w-full h-full object-cover" />;
    }
    return <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${dog.avatarSeed}`} alt={dog.name} className="w-full h-full object-cover" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">{showAdd ? (editingDog ? '编辑信息' : '添加新成员') : '切换狗狗'}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!showAdd ? (
            <>
              {dogs.map(dog => (
                <div key={dog.id} className="relative group">
                  <button
                    onClick={() => { onSelect(dog.id); onClose(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${
                      activeDogId === dog.id ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                      {renderAvatar(dog)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{dog.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {dog.weight ? `${dog.weight}kg` : '未知体重'} · {dog.breed}
                      </p>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEdit(dog); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                  </button>
                </div>
              ))}

              <button 
                onClick={() => setShowAdd(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                添加新成员
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden relative cursor-pointer group hover:border-indigo-200 transition-all shadow-md"
                >
                  {formData.customAvatarUrl ? (
                    <img src={formData.customAvatarUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${formData.name || 'default'}`} className="w-full h-full object-cover" alt="Preview" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">点击上传真实照片</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">名字</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  placeholder="如: 旺财"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出生日期</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">体重 (kg)</label>
                  <input 
                    type="number"
                    step="0.1"
                    placeholder="如: 12.5"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">品种</label>
                <input 
                  type="text"
                  placeholder="如: 柯基 / 金毛"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                  value={formData.breed}
                  onChange={e => setFormData({...formData, breed: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                  {editingDog ? '保存修改' : '确认添加'}
                </button>
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 bg-white text-slate-500 rounded-2xl font-bold border-2 border-slate-100 active:scale-95 transition-all"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DogSelector;
