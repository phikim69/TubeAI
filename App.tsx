op
import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { TitleList } from './components/TitleList';
import { SeoResults } from './components/SeoResults';
import { ThumbnailGenerator } from './components/ThumbnailGenerator';
import { AppState, TitleSuggestion, ImageModelId, AspectRatio } from './types';
import { generateVideoTitles, generateVideoDetails, generateThumbnailImage, generateVideoScript, analyzeReferenceImage } from './services/geminiService';
import { AlertCircle, Wand2, Youtube, Heart, Facebook, MessageCircle, Send, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    originalInput: '',
    isLoadingTitles: false,
    isLoadingDetails: false,
    isLoadingScript: false,
    isLoadingAnalysis: false,
    titles: [],
    selectedTitle: null,
    videoDetails: null,
    currentVisualPrompt: '',
    generatedImageBase64: null,
    thumbnailHistory: [],
    error: null,
    selectedImageModel: 'gemini-2.5-flash-image', 
    selectedAspectRatio: '16:9',
    language: 'Auto',
  });

  // 1. Analyze Image Input (Vision AI)
  const handleImageAnalyze = async (file: File) => {
    setState(prev => ({ ...prev, isLoadingAnalysis: true, error: null }));
    
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Data = reader.result as string;
            // Remove data:image/...;base64, prefix for API
            const cleanBase64 = base64Data.split(',')[1];
            
            try {
                const promptFromImage = await analyzeReferenceImage(cleanBase64, state.language);
                setState(prev => ({ 
                    ...prev, 
                    isLoadingAnalysis: false,
                    // Auto-trigger title generation with the analyzed prompt
                }));
                // We pass the prompt to the title generator immediately
                handleInputSubmit(promptFromImage);
            } catch (err) {
                console.error(err);
                setState(prev => ({ ...prev, isLoadingAnalysis: false, error: "Không thể phân tích ảnh. Thử ảnh khác nhé." }));
            }
        };
    } catch (e) {
        setState(prev => ({ ...prev, isLoadingAnalysis: false, error: "Lỗi đọc file." }));
    }
  };

  // 2. Main Title Generation
  const handleInputSubmit = async (input: string) => {
    setState(prev => ({ 
        ...prev, 
        isLoadingTitles: true, 
        error: null, 
        titles: [],
        selectedTitle: null, 
        videoDetails: null, 
        generatedImageBase64: null,
        currentVisualPrompt: '',
        thumbnailHistory: [],
        originalInput: input
    }));

    try {
      const titles = await generateVideoTitles(input, state.language);
      setState(prev => ({
        ...prev,
        isLoadingTitles: false,
        titles: titles
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoadingTitles: false,
        error: "Không thể phân tích dữ liệu. Vui lòng kiểm tra API Key hoặc thử lại sau."
      }));
    }
  };

  const handleTitleSelect = (title: TitleSuggestion) => {
    if (state.selectedTitle?.text !== title.text) {
        setState(prev => ({ 
            ...prev, 
            selectedTitle: title, 
            videoDetails: null, 
            generatedImageBase64: null,
            currentVisualPrompt: '',
            thumbnailHistory: [] 
        }));
    }
  };

  const handleModelChange = (model: ImageModelId) => {
      setState(prev => ({ ...prev, selectedImageModel: model }));
  };
  
  const handleAspectRatioChange = (ratio: AspectRatio) => {
      setState(prev => ({ ...prev, selectedAspectRatio: ratio }));
  };

  const handlePromptChange = (newPrompt: string) => {
      setState(prev => ({ ...prev, currentVisualPrompt: newPrompt }));
  };
  
  const handleHistorySelect = (base64: string) => {
      setState(prev => ({ ...prev, generatedImageBase64: base64 }));
  };

  const ensureApiKeyForProModel = async (modelId: ImageModelId) => {
    if (modelId === 'gemini-3-pro-image-preview') {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          try {
            await window.aistudio.openSelectKey();
          } catch (e) {
            console.error("Key selection failed or cancelled", e);
          }
        }
      }
    }
  };

  // 3. Confirm & Generate Details (SEO + Thumbnail)
  const handleConfirmAndGenerate = async () => {
    if (!state.selectedTitle) return;

    setState(prev => ({ ...prev, isLoadingDetails: true, error: null }));

    try {
      // Step A: Generate SEO Details
      const details = await generateVideoDetails(state.selectedTitle.text, state.language);
      
      setState(prev => ({
        ...prev,
        videoDetails: details,
        currentVisualPrompt: details.visualPrompt
      }));

      // Step B: Generate Thumbnail
      await ensureApiKeyForProModel(state.selectedImageModel);

      try {
        const imageBase64 = await generateThumbnailImage(
            state.selectedTitle.text, 
            details.visualPrompt, 
            state.selectedImageModel,
            state.selectedAspectRatio
        );
        setState(prev => ({
            ...prev,
            isLoadingDetails: false,
            generatedImageBase64: imageBase64,
            thumbnailHistory: [imageBase64, ...prev.thumbnailHistory] // Add to history
        }));
      } catch (imgErr) {
          console.error("Image generation failed", imgErr);
          setState(prev => ({
              ...prev,
              isLoadingDetails: false,
              error: "Đã tạo SEO nhưng lỗi khi tạo hình ảnh (Có thể do mô hình đang bận)."
          }));
      }

    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoadingDetails: false,
        error: "Không thể tạo nội dung chi tiết. Vui lòng thử lại."
      }));
    }
  };

  // 4. Regenerate Thumbnail Only
  const handleRegenerateThumbnail = async () => {
    if (!state.selectedTitle || !state.currentVisualPrompt) return;
    
    setState(prev => ({ ...prev, isLoadingDetails: true, error: null })); 
    try {
        await ensureApiKeyForProModel(state.selectedImageModel);

        const imageBase64 = await generateThumbnailImage(
            state.selectedTitle.text, 
            state.currentVisualPrompt, 
            state.selectedImageModel,
            state.selectedAspectRatio
        );
        setState(prev => ({
            ...prev,
            isLoadingDetails: false,
            generatedImageBase64: imageBase64,
            thumbnailHistory: [imageBase64, ...prev.thumbnailHistory].slice(0, 5) // Keep last 5
        }));
    } catch (err) {
        setState(prev => ({ ...prev, isLoadingDetails: false, error: "Lỗi tạo lại ảnh. Hãy thử mô hình khác." }));
    }
  };

  // 5. Generate Script
  const handleGenerateScript = async () => {
      if (!state.selectedTitle || !state.videoDetails) return;
      
      setState(prev => ({ ...prev, isLoadingScript: true }));
      try {
          const script = await generateVideoScript(state.selectedTitle.text, state.language);
          setState(prev => ({
              ...prev,
              isLoadingScript: false,
              videoDetails: {
                  ...prev.videoDetails!,
                  script: script
              }
          }));
      } catch (e) {
          setState(prev => ({ ...prev, isLoadingScript: false, error: "Lỗi tạo kịch bản." }));
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 selection:bg-pink-500 selection:text-white pb-10 flex flex-col font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-pink-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 flex-grow max-w-7xl">
        
        {/* Header / Input Section */}
        <section className="mb-16">
           <InputForm 
                onSubmit={handleInputSubmit} 
                isLoading={state.isLoadingTitles} 
                isLoadingAnalysis={state.isLoadingAnalysis}
                selectedLanguage={state.language}
                onLanguageChange={(l) => setState(prev => ({...prev, language: l}))}
                onImageAnalyze={handleImageAnalyze}
           />
        </section>

        {/* Error Message */}
        {state.error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md animate-bounce-short">
                <AlertCircle size={20} />
                <p>{state.error}</p>
            </div>
        )}

        {/* Main Content Grid */}
        {state.titles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            
            {/* Left Column: Titles & SEO/Script Results */}
            <div className="lg:col-span-7 space-y-8">
              <TitleList 
                titles={state.titles} 
                selectedTitle={state.selectedTitle} 
                onSelect={handleTitleSelect} 
              />
              
              {state.videoDetails && (
                 <div className="animate-fade-in">
                    <SeoResults 
                        description={state.videoDetails.description}
                        hashtags={state.videoDetails.hashtags}
                        keywords={state.videoDetails.keywords}
                        tips={state.videoDetails.seoTips}
                        onDescriptionChange={(newDesc) => setState(prev => ({...prev, videoDetails: {...prev.videoDetails!, description: newDesc}}))}
                        script={state.videoDetails.script}
                        onGenerateScript={handleGenerateScript}
                        isLoadingScript={state.isLoadingScript}
                    />
                 </div>
              )}
            </div>

            {/* Right Column: Controls & Visuals */}
            <div className="lg:col-span-5 space-y-6">
                <div className="sticky top-8 space-y-6">
                    {/* Action Card */}
                    <div className={`
                        p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden
                        ${state.selectedTitle 
                            ? 'bg-gray-900/60 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
                            : 'bg-gray-900/40 border-white/5 opacity-70'}
                    `}>
                        {/* Shimmer effect */}
                        {state.selectedTitle && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>}

                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Wand2 className={state.selectedTitle ? "text-indigo-400" : "text-gray-500"} />
                            Xác nhận & Tạo Nội dung
                        </h2>
                        
                        {!state.selectedTitle ? (
                            <p className="text-gray-400 text-sm">Vui lòng chọn một tiêu đề bên trái để kích hoạt AI.</p>
                        ) : (
                            <div className="space-y-5">
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-white/5">
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Tiêu đề đã chọn:</p>
                                    <p className="text-white font-medium italic">"{state.selectedTitle.text}"</p>
                                </div>
                                
                                <button
                                    onClick={handleConfirmAndGenerate}
                                    disabled={state.isLoadingDetails}
                                    className={`
                                        w-full py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-3
                                        transition-all duration-300 transform
                                        ${state.isLoadingDetails 
                                            ? 'bg-gray-700 cursor-wait text-gray-400' 
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:scale-[1.02] hover:shadow-indigo-500/30'}
                                    `}
                                >
                                    {state.isLoadingDetails ? (
                                        <><Loader2 className="animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        <>Bắt đầu Tạo <Wand2 size={18} /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Generator */}
                    <div className="animate-fade-in">
                        <ThumbnailGenerator 
                            selectedTitle={state.selectedTitle}
                            onGenerate={handleRegenerateThumbnail}
                            isLoading={state.isLoadingDetails && !state.generatedImageBase64}
                            imageBase64={state.generatedImageBase64}
                            currentVisualPrompt={state.currentVisualPrompt}
                            onPromptChange={handlePromptChange}
                            selectedModel={state.selectedImageModel}
                            onModelChange={handleModelChange}
                            selectedAspectRatio={state.selectedAspectRatio}
                            onAspectRatioChange={handleAspectRatioChange}
                            history={state.thumbnailHistory}
                            onSelectHistory={handleHistorySelect}
                        />
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#020617]/80 backdrop-blur-lg mt-auto">
        <div className="container mx-auto px-4 py-8 text-center space-y-5">
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center justify-center gap-2">
                <Youtube className="text-red-500 fill-red-500" />
                Developed by Phi Kim
            </h3>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
                <a href="https://zalo.me/phikim9199" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <span className="p-1.5 bg-gray-800 rounded-full group-hover:bg-blue-500/20"><MessageCircle size={14} /></span> 
                    Zalo
                </a>

                <a href="https://www.facebook.com/giadinhvip.net" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <span className="p-1.5 bg-gray-800 rounded-full group-hover:bg-blue-600/20"><Facebook size={14} /></span>
                    Facebook
                </a>
            </div>

            <p className="text-gray-600 text-xs flex items-center justify-center gap-1 pt-2">
                Made with <Heart size={10} className="text-pink-500 fill-pink-500 animate-pulse" /> & Gemini AI
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
