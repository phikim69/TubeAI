
import React from 'react';
import { TitleSuggestion, ImageModelId, AspectRatio } from '../types';
import { Image as ImageIcon, Download, RefreshCw, Settings2, Edit3, Monitor, Smartphone, Square, History, Palette } from 'lucide-react';
import { Loader } from './Loader';

interface ThumbnailGeneratorProps {
  selectedTitle: TitleSuggestion | null;
  onGenerate: () => void;
  isLoading: boolean;
  imageBase64: string | null;
  currentVisualPrompt: string;
  onPromptChange: (prompt: string) => void;
  selectedModel: ImageModelId;
  onModelChange: (model: ImageModelId) => void;
  selectedAspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  history: string[]; // New Prop
  onSelectHistory: (base64: string) => void; // New Prop
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({
  selectedTitle,
  onGenerate,
  isLoading,
  imageBase64,
  currentVisualPrompt,
  onPromptChange,
  selectedModel,
  onModelChange,
  selectedAspectRatio,
  onAspectRatioChange,
  history,
  onSelectHistory
}) => {
  
  if (!selectedTitle) return null;

  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16] max-w-[280px] mx-auto';
      case '1:1': return 'aspect-square max-w-[350px] mx-auto';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4] max-w-[300px] mx-auto';
      default: return 'aspect-video';
    }
  };

  const promptStyles = [
    { label: 'Cinematic', value: 'cinematic lighting, 8k, hyperrealistic, dramatic atmosphere, highly detailed' },
    { label: 'Cartoon', value: 'vibrant cartoon style, bold outlines, flat colors, fun atmosphere' },
    { label: 'Neon/Gaming', value: 'neon cyberpunk style, glowing effects, high contrast, futuristic, esports vibe' },
    { label: 'Minimalist', value: 'minimalist design, solid background, clean composition, high contrast, modern' },
    { label: 'Vlog/Real', value: 'lifestyle vlog style, natural lighting, selfie angle, authentic feel, 4k' },
    { label: 'Tech', value: 'clean tech review style, modern studio setup, bright soft lighting, product focus' },
    { label: 'Horror', value: 'dark gloomy atmosphere, scary, mysterious, high contrast shadows, mist' },
    { label: 'Anime', value: 'anime art style, vibrant colors, detailed background, expressive character' },
  ];

  const handleAddStyle = (styleValue: string) => {
    const trimmedPrompt = currentVisualPrompt.trim();
    // Add comma if prompt is not empty and doesn't already end with one
    const separator = trimmedPrompt.length > 0 && !trimmedPrompt.endsWith(',') ? ', ' : ' ';
    onPromptChange(`${trimmedPrompt}${separator}${styleValue}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <ImageIcon className="text-purple-400" size={20} />
        </div>
        <div>
            <h2 className="text-lg font-bold text-white">Thumbnail AI</h2>
            <p className="text-xs text-gray-400">Tạo ảnh bìa thu hút người xem</p>
        </div>
      </div>

      <div className="bg-gray-800/40 border border-white/10 rounded-2xl p-5 space-y-5 backdrop-blur-sm">
        
        {/* Settings */}
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    <Settings2 size={10} /> Mô hình
                </label>
                <select 
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value as ImageModelId)}
                    className="w-full bg-gray-900 text-white text-xs rounded-lg border border-gray-600 px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                    disabled={isLoading}
                >
                    <option value="gemini-2.5-flash-image">Nano Banana (Nhanh)</option>
                    <option value="gemini-3-pro-image-preview">Nano Banana Pro (Đẹp)</option>
                    <option value="imagen-3.0-generate-001">Imagen 3</option>
                    <option value="imagen-4.0-generate-001">Imagen 4</option>
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                     <Monitor size={10} /> Tỷ lệ
                </label>
                <select 
                    value={selectedAspectRatio}
                    onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
                    className="w-full bg-gray-900 text-white text-xs rounded-lg border border-gray-600 px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                    disabled={isLoading}
                >
                    <option value="16:9">16:9 (YouTube Video)</option>
                    <option value="9:16">9:16 (Shorts/TikTok)</option>
                    <option value="1:1">1:1 (Instagram)</option>
                </select>
            </div>
        </div>

        {/* Loading */}
        {isLoading && (
            <div className={`border border-white/5 bg-gray-900/50 rounded-xl flex flex-col items-center justify-center p-6 transition-all shadow-inner ${getAspectRatioClass(selectedAspectRatio)}`}>
                <Loader message="Đang vẽ tác phẩm nghệ thuật..." />
            </div>
        )}

        {/* Main Image */}
        {imageBase64 && !isLoading && (
          <div className="animate-fade-in space-y-4">
            <div className={`relative group rounded-xl overflow-hidden border border-gray-600 shadow-2xl transition-all ${getAspectRatioClass(selectedAspectRatio)}`}>
              <img 
                src={`data:image/jpeg;base64,${imageBase64}`} 
                alt="Thumbnail" 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <a 
                    href={`data:image/jpeg;base64,${imageBase64}`} 
                    download={`thumbnail-${Date.now()}.jpg`}
                    className="bg-white hover:bg-gray-200 text-black px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transform hover:scale-105 transition-all shadow-lg"
                >
                    <Download size={16} /> Tải HD
                </a>
              </div>
            </div>

            {/* History Gallery */}
            {history.length > 0 && (
                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1">
                        <History size={10} /> Lịch sử tạo (Click để chọn)
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                        {history.map((h, i) => (
                            <div 
                                key={i}
                                onClick={() => onSelectHistory(h)}
                                className={`
                                    relative shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all snap-start
                                    ${h === imageBase64 ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-gray-700 opacity-60 hover:opacity-100'}
                                `}
                            >
                                <img src={`data:image/jpeg;base64,${h}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Prompt Editor */}
            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/5 space-y-3 group focus-within:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    <span className="flex items-center gap-1"><Edit3 size={10} /> Prompt (Mô tả ảnh)</span>
                    <span className="text-indigo-400 group-hover:underline cursor-pointer" onClick={onGenerate}>Tạo lại ngay</span>
                </div>
                <textarea
                    value={currentVisualPrompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    className="w-full bg-transparent text-gray-300 text-xs p-1 outline-none h-16 resize-none leading-relaxed"
                    placeholder="Mô tả chi tiết hình ảnh bạn muốn tạo..."
                />
                
                {/* Style Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mr-1"><Palette size={10}/> Styles:</span>
                    {promptStyles.map((style) => (
                        <button
                            key={style.label}
                            onClick={() => handleAddStyle(style.value)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30 transition-all whitespace-nowrap"
                            title={style.value}
                        >
                            + {style.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <button
                onClick={onGenerate}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg"
            >
                <RefreshCw size={16} />
                Vẽ lại (Regenerate)
            </button>
          </div>
        )}
        
        {!isLoading && !imageBase64 && (
            <div className="text-center py-10 px-4 bg-gray-900/30 rounded-xl border border-dashed border-gray-700">
                <ImageIcon className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="text-sm text-gray-400">Chọn tiêu đề và nhấn "Bắt đầu Tạo" để xem phép màu.</p>
            </div>
        )}
      </div>
    </div>
  );
};
