import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { TabNavigation, TabType } from "@/components/TabNavigation";
import { PreviewArea } from "@/components/PreviewArea";
import { HistorySection } from "@/components/HistorySection";
import { StickerForm, StickerGeneratorType } from "@/components/forms/StickerForm";
import { AnimationForm, AnimationGeneratorType } from "@/components/forms/AnimationForm";
import { PremiumVideoForm, PremiumMode } from "@/components/forms/PremiumVideoForm";
import { ImageGenerationForm } from "@/components/forms/ImageGenerationForm";
import {
  generateFreeSticker,
  generateReplicateSticker,
  generateGeminiSticker,
  generateFreeAnimation,
  generateReplicateAnimation,
  generateGeminiAnimation,
  generatePremiumVideo,
  generateVideoOnly,
  getTransparentVideo,
  generateImage,
  downloadBlob,
  getHistory,
  addToHistory,
  HistoryItem,
  GenerationResult,
} from "@/lib/api";

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>('stickers');
  const [selectedStickerType, setSelectedStickerType] = useState<StickerGeneratorType>('free');
  const [selectedAnimationType, setSelectedAnimationType] = useState<AnimationGeneratorType>('free');

  // Granular Input Persistence
  const [stickerInputs, setStickerInputs] = useState<Record<StickerGeneratorType, { prompt: string, animation: string, referenceImage: File | null, imagePreview: string | null }>>({
    free: { prompt: '', animation: 'float', referenceImage: null, imagePreview: null },
    replicate: { prompt: '', animation: 'bounce', referenceImage: null, imagePreview: null },
    gemini: { prompt: '', animation: 'float', referenceImage: null, imagePreview: null },
  });

  const [animationInputs, setAnimationInputs] = useState<Record<AnimationGeneratorType, { concept: string, frames: number, referenceImage: File | null, imagePreview: string | null }>>({
    free: { concept: '', frames: 2, referenceImage: null, imagePreview: null },
    replicate: { concept: '', frames: 2, referenceImage: null, imagePreview: null },
    gemini: { concept: '', frames: 2, referenceImage: null, imagePreview: null },
  });

  const [premiumPrompt, setPremiumPrompt] = useState('');
  const [premiumDuration, setPremiumDuration] = useState(3);
  const [premiumMode, setPremiumMode] = useState<PremiumMode>('sticker');
  const [premiumAspectRatio, setPremiumAspectRatio] = useState('16:9_480p');

  const [imageInputs, setImageInputs] = useState({
    prompt: '',
    aspectRatio: '1:1',
  });


  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Generating...');

  // Granular results for every single generator type
  const [tabResults, setTabResults] = useState<Record<string, {
    url: string | null;
    blob: Blob | null;
    taskId: string | null;
    transparentUrl?: string | null;
    transparentBlob?: Blob | null;
  }>>({
    stickers_free: { url: null, blob: null, taskId: null },
    stickers_replicate: { url: null, blob: null, taskId: null },
    stickers_gemini: { url: null, blob: null, taskId: null },
    animations_free: { url: null, blob: null, taskId: null },
    animations_replicate: { url: null, blob: null, taskId: null },
    animations_gemini: { url: null, blob: null, taskId: null },

    premium_premium: { url: null, blob: null, taskId: null, transparentUrl: null, transparentBlob: null },
    image_gen: { url: null, blob: null, taskId: null },
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Prevent "stale" requests from updating UI after the user switches generators/tabs.
  const requestSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const beginRequest = useCallback(() => {
    requestSeqRef.current += 1;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return { requestId: requestSeqRef.current, signal: controller.signal };
  }, []);

  const isLatest = useCallback((requestId: number) => {
    return requestId === requestSeqRef.current;
  }, []);

  useEffect(() => {
    setHistory(getHistory());
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const resetPreview = useCallback(() => {
    // Invalidate any in-flight request
    console.log('[DEBUG] resetPreview called');
    requestSeqRef.current += 1;

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    // Clear only the current tab's result if needed, but usually we just want to stop loading
    setIsLoading(false);
  }, []);

  const handleResult = (
    requestId: number,
    result: GenerationResult,
    type: 'sticker' | 'animation' | 'video' | 'image',
    subType: string,
    prompt: string
  ) => {
    if (!isLatest(requestId)) return;

    let resultKey = '';
    if (type === 'video') resultKey = 'premium_premium';
    else if (type === 'image') resultKey = 'image_gen';
    else resultKey = `${type}s_${subType}`;

    setTabResults(prev => ({
      ...prev,
      [resultKey]: {
        url: result.url,
        blob: result.blob,
        taskId: result.taskId || null
      }
    }));

    // Add to history
    addToHistory({
      type,
      subType,
      prompt,
      thumbnail: result.url,
      downloadUrl: result.url,
      taskId: result.taskId,
    });
    refreshHistory();

    toast.success('Generation complete!', {
      description: 'Your creation is ready to download.',
    });
  };

  const handleStickerGenerate = async (
    type: StickerGeneratorType,
    prompt: string,
    animation: string,
    referenceImage?: File
  ) => {
    const { requestId, signal } = beginRequest();
    console.log('[DEBUG] handleStickerGenerate started, requestId:', requestId);

    setIsLoading(true);
    setLoadingMessage('Generating sticker...');

    const resultKey = `stickers_${type}`;

    // Clear only this specific generator's result to show skeleton
    setTabResults(prev => ({
      ...prev,
      [resultKey]: { url: null, blob: null, taskId: null }
    }));

    try {
      let result: GenerationResult;

      switch (type) {
        case 'free':
          result = await generateFreeSticker(prompt, animation as any, signal);
          break;
        case 'replicate':
          result = await generateReplicateSticker(prompt, animation as any, signal);
          break;
        case 'gemini':
          result = await generateGeminiSticker(prompt, animation as any, referenceImage, signal);
          break;
      }

      handleResult(requestId, result, 'sticker', type, prompt);
    } catch (error) {
      console.log('[DEBUG] handleStickerGenerate catch block, signal.aborted:', signal.aborted);
      if (signal.aborted) {
        console.log('[DEBUG] Request was aborted, returning early');
        return;
      }

      console.error('Generation failed:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      const latest = isLatest(requestId);
      console.log('[DEBUG] handleStickerGenerate finally block, requestId:', requestId, 'isLatest:', latest);
      if (latest) setIsLoading(false);
    }
  };

  const handleAnimationGenerate = async (
    type: AnimationGeneratorType,
    concept: string,
    frames: number,
    referenceImage?: File
  ) => {
    const { requestId, signal } = beginRequest();

    setIsLoading(true);
    setLoadingMessage('Generating animation...');

    const resultKey = `animations_${type}`;

    // Clear only this specific result
    setTabResults(prev => ({
      ...prev,
      [resultKey]: { url: null, blob: null, taskId: null }
    }));

    try {
      let result: GenerationResult;

      switch (type) {
        case 'free':
          result = await generateFreeAnimation(concept, frames, signal);
          break;
        case 'replicate':
          result = await generateReplicateAnimation(concept, frames, signal);
          break;
        case 'gemini':
          result = await generateGeminiAnimation(concept, frames, referenceImage, signal);
          break;
      }

      handleResult(requestId, result, 'animation', type, concept);
    } catch (error) {
      if (signal.aborted) return;

      console.error('Generation failed:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      if (isLatest(requestId)) setIsLoading(false);
    }
  };

  const handlePremiumGenerate = async (prompt: string, duration: number, mode: PremiumMode, aspectRatio: string) => {
    const { requestId, signal } = beginRequest();

    setIsLoading(true);
    setLoadingMessage(mode === 'sticker'
      ? 'Generating premium sticker... This takes 2-5 minutes'
      : 'Generating background video... This takes 2-5 minutes'
    );

    // Clear only this specific result
    setTabResults(prev => ({
      ...prev,
      premium_premium: { url: null, blob: null, taskId: null, transparentUrl: null, transparentBlob: null }
    }));

    try {
      let result: GenerationResult;

      if (mode === 'sticker') {
        result = await generatePremiumVideo(prompt, duration, signal);
      } else {
        result = await generateVideoOnly(prompt, duration, aspectRatio, signal);
      }

      if (!isLatest(requestId)) return;

      setTabResults(prev => ({
        ...prev,
        premium_premium: {
          url: result.url,
          blob: result.blob,
          taskId: result.taskId || null,
          transparentUrl: null,
          transparentBlob: null,
        }
      }));

      // Automatically fetch transparent version ONLY for sticker mode
      if (mode === 'sticker' && result.taskId) {
        setLoadingMessage('Generating transparent version...');
        try {
          const transResult = await getTransparentVideo(result.taskId, signal);
          if (isLatest(requestId)) {
            setTabResults(prev => ({
              ...prev,
              premium_premium: {
                ...prev.premium_premium,
                transparentUrl: transResult.url,
                transparentBlob: transResult.blob,
              }
            }));
            toast.success('Transparent version ready!');
          }
        } catch (error) {
          console.error('Failed to auto-fetch transparent video:', error);
          // Don't fail the whole flow, just log it. MP4 is still good.
        }
      }

      addToHistory({
        type: 'video',
        subType: mode === 'sticker' ? 'premium_sticker' : 'premium_video',
        prompt,
        thumbnail: result.url,
        downloadUrl: result.url,
        taskId: result.taskId,
      });
      refreshHistory();

      toast.success('Video generated!', {
        description: 'Your creation is ready to download.',
      });
    } catch (error) {
      if (signal.aborted) return;

      console.error('Generation failed:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      if (isLatest(requestId)) setIsLoading(false);
    }
  };

  const handleImageGenerate = async (prompt: string, aspectRatio: string) => {
    const { requestId, signal } = beginRequest();

    setIsLoading(true);
    setLoadingMessage('Generating image...');

    // Clear only this specific result
    setTabResults(prev => ({
      ...prev,
      image_gen: { url: null, blob: null, taskId: null }
    }));

    try {
      const result = await generateImage(prompt, aspectRatio, signal);

      handleResult(requestId, result, 'image', 'gen', prompt);

    } catch (error) {
      if (signal.aborted) return;

      console.error('Generation failed:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      if (isLatest(requestId)) setIsLoading(false);
    }
  };


  const getCurrentResultKey = () => {
    if (activeTab === 'stickers') return `stickers_${selectedStickerType}`;
    if (activeTab === 'animations') return `animations_${selectedAnimationType}`;
    if (activeTab === 'image') return 'image_gen';
    return 'premium_premium';
  };

  const handleDownload = () => {
    const resultKey = getCurrentResultKey();
    const current = tabResults[resultKey];
    if (!current.blob) return;

    let filename = 'download.webp';
    if (activeTab === 'premium') filename = 'sticker_original.mp4';
    else if (activeTab === 'image') filename = 'generated_image.jpg';

    downloadBlob(current.blob, filename);
  };

  const handleDownloadTransparent = async () => {
    const resultKey = getCurrentResultKey();
    const current = tabResults[resultKey];
    if (!current.taskId) return;

    const { requestId, signal } = beginRequest();

    setIsLoading(true);
    setLoadingMessage('Fetching transparent version...');

    try {
      const result = await getTransparentVideo(current.taskId, signal);
      if (!isLatest(requestId)) return;

      downloadBlob(current.transparentBlob || await (async () => {
        // Fallback if not already fetched (shouldn't happen with auto-fetch but good for safety)
        const res = await getTransparentVideo(current.taskId!, signal);
        return res.blob;
      })(), 'sticker_transparent.webp');
      toast.success('Transparent version downloaded!');
    } catch (error) {
      if (signal.aborted) return;

      console.error('Download failed:', error);
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      if (isLatest(requestId)) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl px-4 py-4 space-y-4">
        {/* Tab Navigation */}
        <div className="flex justify-center">
          <TabNavigation activeTab={activeTab} isLoading={isLoading} onTabChange={(tab) => {
            console.log('[DEBUG] Tab changed to:', tab);
            setActiveTab(tab);
            // No resetPreview here anymore, we want to retain state!
          }} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Form */}
          <div className="p-5 rounded-xl border bg-card shadow-xs">
            {activeTab === 'stickers' && (
              <StickerForm
                isLoading={isLoading}
                selectedType={selectedStickerType}
                onTypeChange={setSelectedStickerType}
                state={stickerInputs[selectedStickerType]}
                setState={(newState) => setStickerInputs(prev => ({
                  ...prev,
                  [selectedStickerType]: { ...prev[selectedStickerType], ...newState }
                }))}
                onGenerate={handleStickerGenerate}
              />
            )}
            {activeTab === 'animations' && (
              <AnimationForm
                isLoading={isLoading}
                selectedType={selectedAnimationType}
                onTypeChange={setSelectedAnimationType}
                state={animationInputs[selectedAnimationType]}
                setState={(newState) => setAnimationInputs(prev => ({
                  ...prev,
                  [selectedAnimationType]: { ...prev[selectedAnimationType], ...newState }
                }))}
                onGenerate={handleAnimationGenerate}
              />
            )}
            {activeTab === 'premium' && (
              <PremiumVideoForm
                prompt={premiumPrompt}
                setPrompt={setPremiumPrompt}
                duration={premiumDuration}
                setDuration={setPremiumDuration}
                mode={premiumMode}
                setMode={setPremiumMode}
                aspectRatio={premiumAspectRatio}
                setAspectRatio={setPremiumAspectRatio}
                onGenerate={handlePremiumGenerate}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'image' && (
              <ImageGenerationForm
                prompt={imageInputs.prompt}
                setPrompt={(val) => setImageInputs(prev => ({ ...prev, prompt: val }))}
                aspectRatio={imageInputs.aspectRatio}
                setAspectRatio={(val) => setImageInputs(prev => ({ ...prev, aspectRatio: val }))}
                onGenerate={handleImageGenerate}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Preview Area */}
          <div className="p-5 rounded-xl border bg-card shadow-xs">
            <PreviewArea
              previewUrl={tabResults[getCurrentResultKey()].url}
              transparentPreviewUrl={activeTab === 'premium' ? tabResults['premium_premium']?.transparentUrl : null}
              previewType={activeTab === 'premium' ? 'video' : 'image'}
              downloadLabel={activeTab === 'image' ? 'JPG' : (activeTab === 'premium' ? 'MP4' : 'WebP')}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              onDownload={tabResults[getCurrentResultKey()].blob ? handleDownload : undefined}
              onDownloadTransparent={(activeTab === 'premium' && (tabResults['premium_premium'].taskId || tabResults['premium_premium']?.transparentBlob)) ? handleDownloadTransparent : undefined}
              taskId={tabResults[getCurrentResultKey()].taskId}
            />
          </div>
        </div>

        {/* History Section */}
        <HistorySection history={history} onRefresh={refreshHistory} />
      </main>
    </div>
  );
}
