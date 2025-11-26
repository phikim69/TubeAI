
import React from 'react';
import { TitleSuggestion } from '../types';
import { CheckCircle2, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

interface TitleListProps {
  titles: TitleSuggestion[];
  selectedTitle: TitleSuggestion | null;
  onSelect: (title: TitleSuggestion) => void;
}

export const TitleList: React.FC<TitleListProps> = ({ titles, selectedTitle, onSelect }) => {
  
  // SEO Length Logic: Optimal 20-60, Max 100
  const getLengthStatus = (length: number) => {
    if (length < 20) return { color: 'text-yellow-500', bg: 'bg-yellow-500', msg: 'Hơi ngắn' };
    if (length > 60 && length <= 70) return { color: 'text-yellow-500', bg: 'bg-yellow-500', msg: 'Khá dài (Cẩn thận bị cắt)' };
    if (length > 70) return { color: 'text-red-500', bg: 'bg-red-500', msg: 'Quá dài (Sẽ bị cắt)' };
    return { color: 'text-green-500', bg: 'bg-green-500', msg: 'Độ dài hoàn hảo' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Zap className="text-white" size={20} />
        </div>
        <div>
           <h2 className="text-xl font-bold text-white">1. Chọn Tiêu Đề Chuẩn SEO</h2>
           <p className="text-xs text-gray-400">AI đã tối ưu hóa CTR và từ khóa</p>
        </div>
      </div>

      <div className="grid gap-4">
        {titles.map((t, idx) => {
          const isSelected = selectedTitle?.text === t.text;
          const len = t.text.length;
          const status = getLengthStatus(len);
          const percent = Math.min((len / 100) * 100, 100);

          return (
            <div
              key={idx}
              onClick={() => onSelect(t)}
              className={`
                relative p-5 rounded-xl border cursor-pointer transition-all duration-300 group
                ${isSelected 
                  ? 'bg-indigo-900/40 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                  : 'bg-gray-800/40 border-white/5 hover:bg-gray-800/60 hover:border-gray-600'
                }
              `}
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className={`font-medium text-lg leading-snug ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                  {t.text}
                </h3>
                
                <div className={`
                  shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${isSelected ? 'border-indigo-400 bg-indigo-500 scale-110' : 'border-gray-600 group-hover:border-gray-400'}
                `}>
                  {isSelected && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </div>

              {/* Tags & Score */}
              <div className="flex flex-wrap items-center justify-between gap-y-2">
                <div className="flex gap-2 text-xs">
                    <span className="bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/20 font-medium">
                      {t.hookType}
                    </span>
                    <span className="bg-green-500/10 text-green-300 px-2.5 py-1 rounded-md border border-green-500/20 flex items-center gap-1 font-medium">
                      <TrendingUp size={12} /> {t.score}/100
                    </span>
                </div>

                {/* Character Counter */}
                <div className="flex items-center gap-2 text-xs">
                   <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${status.bg}`} 
                        style={{ width: `${percent}%` }}
                      />
                   </div>
                   <span className={`${status.color} font-medium`}>
                      {len}/100
                   </span>
                </div>
              </div>
              
              {/* Length Warning */}
              {len > 60 && isSelected && (
                  <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
                      <AlertTriangle size={12} /> {status.msg}
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
