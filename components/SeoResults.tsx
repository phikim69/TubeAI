
import React, { useState, useEffect } from 'react';
import { Hash, Key, Lightbulb, FileText, Copy, Check, Edit, Save, FileVideo, Wand2, Loader2, ClipboardCopy } from 'lucide-react';
import { VideoScript } from '../types';

interface SeoResultsProps {
  hashtags: string[];
  keywords: string[];
  tips: string[];
  description?: string;
  onDescriptionChange: (newDesc: string) => void;
  script?: VideoScript;
  onGenerateScript: () => void;
  isLoadingScript: boolean;
}

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return (
    <div className="whitespace-pre-wrap leading-relaxed font-mono text-sm text-gray-300">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

export const SeoResults: React.FC<SeoResultsProps> = ({ 
  hashtags, keywords, tips, description, onDescriptionChange, 
  script, onGenerateScript, isLoadingScript 
}) => {
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localDescription, setLocalDescription] = useState(description || '');
  const [activeTab, setActiveTab] = useState<'details' | 'script'>('details');

  useEffect(() => {
    setLocalDescription(description || '');
  }, [description]);

  const handleCopyDescription = () => {
    if (localDescription) {
      navigator.clipboard.writeText(localDescription);
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };
  
  const handleCopyTags = () => {
      // Format: tag1, tag2, tag3 (Standard YouTube Studio input)
      const text = keywords.join(', ');
      navigator.clipboard.writeText(text);
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
  };

  const handleSaveDescription = () => {
    onDescriptionChange(localDescription);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher */}
      <div className="flex bg-gray-900/50 p-1 rounded-xl border border-white/10">
        <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <Key size={16} /> SEO & Tags
        </button>
        <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'script' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <FileVideo size={16} /> Kịch Bản AI
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="space-y-6 animate-fade-in">
             {/* Hashtags */}
            <div className="bg-gray-800/40 rounded-xl border border-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                <Hash className="text-pink-400" size={20} />
                <h3 className="font-semibold text-white">Hashtags Trend</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, i) => (
                    <span key={i} className="text-sm bg-pink-500/10 text-pink-300 px-3 py-1 rounded-full border border-pink-500/20 hover:bg-pink-500/20 transition-colors cursor-pointer select-all">
                    {tag}
                    </span>
                ))}
                </div>
            </div>

            {/* Keywords */}
            <div className="bg-gray-800/40 rounded-xl border border-white/10 p-5 backdrop-blur-sm relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Key className="text-yellow-400" size={20} />
                        <h3 className="font-semibold text-white">Từ khóa (Tags)</h3>
                    </div>
                    <button 
                        onClick={handleCopyTags}
                        className="flex items-center gap-1.5 text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-500/20 transition-colors"
                        title="Copy dạng: tag1, tag2, tag3"
                    >
                        {copiedTags ? <Check size={14} /> : <ClipboardCopy size={14} />}
                        {copiedTags ? 'Đã copy' : 'Copy chuẩn Youtube'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                    <span key={i} className="text-sm bg-yellow-500/10 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-pointer select-all">
                    {kw}
                    </span>
                ))}
                </div>
            </div>
            
             {/* Description - Enhanced Section */}
            <div className="bg-gray-800/40 rounded-xl border border-white/10 p-5 backdrop-blur-sm relative group">
                <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2">
                        <FileText className="text-green-400" size={20} />
                        <h3 className="font-semibold text-white">Mô tả Video</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto">
                        <button 
                            onClick={() => isEditing ? handleSaveDescription() : setIsEditing(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-xs font-medium border
                            ${isEditing 
                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                : 'bg-transparent border-gray-600 text-gray-300 hover:text-white hover:border-gray-400'
                            }`}
                        >
                            {isEditing ? <><Save size={14} /> Lưu</> : <><Edit size={14} /> Sửa</>}
                        </button>

                        {!isEditing && (
                            <button 
                            onClick={handleCopyDescription}
                            className="flex items-center gap-1.5 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-md transition-colors font-medium"
                            >
                            {copiedDesc ? <><Check size={14} className="text-green-400"/> Copied</> : <><Copy size={14}/> Copy</>}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg border border-white/5 overflow-hidden">
                    {isEditing ? (
                        <textarea
                            value={localDescription}
                            onChange={(e) => setLocalDescription(e.target.value)}
                            className="w-full h-[400px] bg-gray-900 text-gray-300 p-4 outline-none resize-y font-mono text-sm leading-relaxed"
                            placeholder="Nhập mô tả video..."
                        />
                    ) : (
                        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {localDescription ? (
                                <SimpleMarkdown content={localDescription} />
                            ) : (
                                <p className="text-gray-500 italic">Chưa có mô tả...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      ) : (
        /* SCRIPT TAB */
        <div className="space-y-6 animate-fade-in">
            {!script ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-white/10 border-dashed">
                    <FileVideo size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Chưa có kịch bản</h3>
                    <p className="text-gray-400 mb-6">AI sẽ viết kịch bản chi tiết dựa trên tiêu đề bạn chọn.</p>
                    <button
                        onClick={onGenerateScript}
                        disabled={isLoadingScript}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto transition-all hover:scale-105"
                    >
                        {isLoadingScript ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                        {isLoadingScript ? 'Đang viết kịch bản...' : 'Tạo Kịch Bản Ngay'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-gray-800/40 p-5 rounded-xl border border-white/10">
                        <h4 className="text-blue-400 font-bold mb-2 uppercase text-xs tracking-wider">Mở đầu (Hook)</h4>
                        <p className="text-gray-200 leading-relaxed">{script.intro}</p>
                    </div>
                    
                    <div className="bg-gray-800/40 p-5 rounded-xl border border-white/10">
                        <h4 className="text-purple-400 font-bold mb-3 uppercase text-xs tracking-wider">Nội dung chính</h4>
                        <ul className="space-y-3">
                            {script.mainContent.map((point, i) => (
                                <li key={i} className="flex gap-3 text-gray-300">
                                    <span className="bg-purple-500/20 text-purple-300 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 border border-purple-500/30">{i+1}</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-800/40 p-5 rounded-xl border border-white/10">
                        <h4 className="text-green-400 font-bold mb-2 uppercase text-xs tracking-wider">Kêu gọi (CTA)</h4>
                        <p className="text-gray-200 leading-relaxed">{script.callToAction}</p>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
