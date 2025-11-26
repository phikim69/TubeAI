
import React, { useRef, useState } from 'react';
import { Search, Globe, Sparkles, ImagePlus, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface InputFormProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  isLoadingAnalysis: boolean;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onImageAnalyze: (file: File) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ 
  onSubmit, 
  isLoading, 
  isLoadingAnalysis,
  selectedLanguage, 
  onLanguageChange,
  onImageAnalyze
}) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageAnalyze(e.target.files[0]);
    }
  };

  const languages: Language[] = ['Auto', 'Vietnamese', 'English', 'Spanish', 'Japanese', 'Korean', 'French', 'German', 'Indonesian'];

  return (
    <div className="w-full max-w-4xl mx-auto text-center space-y-8 relative">
      {/* Header with improved typography */}
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-extrabold pb-2 tracking-tight drop-shadow-2xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            TubeGenius
          </span>
          <span className="text-white ml-2 text-4xl md:text-6xl font-light">AI</span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-medium text-indigo-200/90">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <h2 className="tracking-wide">Tối ưu hóa Video & Hình ảnh chuẩn SEO</h2>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>
      </div>
      
      {/* Input Section */}
      <div className="relative group max-w-3xl mx-auto z-20">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
        
        <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row items-stretch bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Language Selector */}
          <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-white/10 bg-white/5">
             <Globe size={18} className="text-blue-400" />
             <select 
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-gray-200 text-sm font-medium outline-none cursor-pointer hover:text-white appearance-none pr-2"
                disabled={isLoading}
             >
                {languages.map(lang => (
                    <option key={lang} value={lang} className="bg-gray-800 text-white">
                        {lang === 'Auto' ? 'Auto Lang' : lang}
                    </option>
                ))}
             </select>
          </div>

          <input
            type="text"
            className="flex-grow bg-transparent text-white px-6 py-4 outline-none placeholder-gray-500 text-lg font-light"
            placeholder={isLoadingAnalysis ? "Đang phân tích hình ảnh của bạn..." : "Nhập tiêu đề, ý tưởng, hoặc upload ảnh..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isLoadingAnalysis}
          />
          
          <div className="flex border-t md:border-t-0 md:border-l border-white/10">
            {/* Vision AI Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isLoadingAnalysis}
              className="px-5 py-3 hover:bg-white/5 text-gray-400 hover:text-pink-400 transition-colors border-r border-white/10 flex items-center justify-center gap-2 relative"
              title="Upload ảnh để AI phân tích"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              {isLoadingAnalysis ? <Loader2 className="animate-spin text-pink-500" size={20} /> : <ImagePlus size={20} />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600/80 hover:bg-indigo-500 text-white px-8 py-3 font-semibold transition-all flex items-center gap-2 min-w-[140px] justify-center hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Search size={20} />
                  <span>Phân tích</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Helper text */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
        <span className="flex items-center gap-1.5"><ImagePlus size={14} className="text-pink-400"/> Vision AI (Phân tích ảnh)</span>
        <span className="flex items-center gap-1.5"><Search size={14} className="text-blue-400"/> SEO Optimization</span>
        <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-yellow-400"/> Content Creator</span>
      </div>
    </div>
  );
};
