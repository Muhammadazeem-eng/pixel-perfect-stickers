import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { TabNavigation, TabType } from "@/components/TabNavigation";
import { PreviewArea } from "@/components/PreviewArea";
import { HistorySection } from "@/components/HistorySection";
import { StickerForm, StickerGeneratorType } from "@/components/forms/StickerForm";
import { AnimationForm, AnimationGeneratorType } from "@/components/forms/AnimationForm";
import { PremiumVideoForm } from "@/components/forms/PremiumVideoForm";
import {
  generateFreeSticker,
  generateReplicateSticker,
  generateGeminiSticker,
  generateFreeAnimation,
  generateReplicateAnimation,
  generateGeminiAnimation,
  generatePremiumVideo,
  getTransparentVideo,
  downloadBlob,
  getHistory,
  addToHistory,
  HistoryItem,
  GenerationResult,
} from "@/lib/api";

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>('stickers');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Generating...');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const resetPreview = useCallback(() => {
    setPreviewUrl(null);
    setCurrentBlob(null);
    setTaskId(null);
    setIsLoading(false);
  }, []);

  const handleResult = (result: GenerationResult, type: 'sticker' | 'animation' | 'video', subType: string, prompt: string) => {
    setPreviewUrl(result.url);
    setCurrentBlob(result.blob);
    if (result.taskId) setTaskId(result.taskId);

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
    setIsLoading(true);
    setLoadingMessage('Generating sticker...');
    setPreviewType('image');
    setTaskId(null);

    try {
      let result: GenerationResult;
      
      switch (type) {
        case 'free':
          result = await generateFreeSticker(prompt, animation as any);
          break;
        case 'replicate':
          result = await generateReplicateSticker(prompt, animation as any);
          break;
        case 'gemini':
          result = await generateGeminiSticker(prompt, animation as any, referenceImage);
          break;
      }

      handleResult(result, 'sticker', type, prompt);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimationGenerate = async (
    type: AnimationGeneratorType,
    concept: string,
    frames: number,
    referenceImage?: File
  ) => {
    setIsLoading(true);
    setLoadingMessage('Generating animation...');
    setPreviewType('image');
    setTaskId(null);

    try {
      let result: GenerationResult;
      
      switch (type) {
        case 'free':
          result = await generateFreeAnimation(concept, frames);
          break;
        case 'replicate':
          result = await generateReplicateAnimation(concept, frames);
          break;
        case 'gemini':
          result = await generateGeminiAnimation(concept, frames, referenceImage);
          break;
      }

      handleResult(result, 'animation', type, concept);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumGenerate = async (prompt: string) => {
    setIsLoading(true);
    setLoadingMessage('Generating premium video... This may take 2-5 minutes');
    setPreviewType('video');

    try {
      const result = await generatePremiumVideo(prompt);
      setPreviewUrl(result.url);
      setCurrentBlob(result.blob);
      if (result.taskId) setTaskId(result.taskId);

      addToHistory({
        type: 'video',
        subType: 'premium',
        prompt,
        thumbnail: result.url,
        downloadUrl: result.url,
        taskId: result.taskId,
      });
      refreshHistory();

      toast.success('Video generated!', {
        description: 'You can now download the original MP4 or transparent WebP.',
      });
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!currentBlob) return;
    const filename = previewType === 'video' ? 'sticker_original.mp4' : 'whatsapp_sticker.webp';
    downloadBlob(currentBlob, filename);
  };

  const handleDownloadTransparent = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    setLoadingMessage('Fetching transparent version...');

    try {
      const result = await getTransparentVideo(taskId);
      downloadBlob(result.blob, 'sticker_transparent.webp');
      toast.success('Transparent version downloaded!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 md:px-6 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex justify-center">
          <TabNavigation activeTab={activeTab} onTabChange={(tab) => {
            setActiveTab(tab);
            resetPreview();
          }} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            {activeTab === 'stickers' && (
              <StickerForm onGenerate={handleStickerGenerate} isLoading={isLoading} onTypeChange={resetPreview} />
            )}
            {activeTab === 'animations' && (
              <AnimationForm onGenerate={handleAnimationGenerate} isLoading={isLoading} onTypeChange={resetPreview} />
            )}
            {activeTab === 'premium' && (
              <PremiumVideoForm onGenerate={handlePremiumGenerate} isLoading={isLoading} />
            )}
          </div>

          {/* Preview Area */}
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <PreviewArea
              previewUrl={previewUrl}
              previewType={previewType}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              onDownload={currentBlob ? handleDownload : undefined}
              onDownloadTransparent={taskId ? handleDownloadTransparent : undefined}
              taskId={taskId}
            />
          </div>
        </div>

        {/* History Section */}
        <HistorySection history={history} onRefresh={refreshHistory} />
      </main>
    </div>
  );
}
