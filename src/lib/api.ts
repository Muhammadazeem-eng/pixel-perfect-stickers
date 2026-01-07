const API_BASE_URL = 'http://localhost:8000';

export type AnimationType = 'float' | 'bounce' | 'pulse' | 'wiggle' | 'static';
export type ReplicateAnimationType = 'bounce' | 'shake' | 'pulse' | 'wiggle' | 'static';

export interface GenerationResult {
  blob: Blob;
  url: string;
  taskId?: string;
}

export interface HistoryItem {
  id: string;
  type: 'sticker' | 'animation' | 'video';
  subType: string;
  prompt: string;
  thumbnail: string;
  downloadUrl: string;
  taskId?: string; // For premium video transparent download
  timestamp: Date;
}

// Helper to download file from blob
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Free Sticker Generator
export async function generateFreeSticker(
  prompt: string,
  animation: AnimationType = 'float',
  signal?: AbortSignal
): Promise<GenerationResult> {
  const params = new URLSearchParams({ prompt, animation });
  const response = await fetch(`${API_BASE_URL}/generate-free-sticker?${params}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate sticker: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url };
}

// Replicate Sticker Generator
export async function generateReplicateSticker(
  prompt: string,
  animation: ReplicateAnimationType = 'bounce',
  signal?: AbortSignal
): Promise<GenerationResult> {
  const params = new URLSearchParams({ prompt, animation });
  const response = await fetch(`${API_BASE_URL}/generate-replicate-sticker?${params}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate sticker: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url };
}

// Gemini Sticker Generator
export async function generateGeminiSticker(
  prompt: string,
  animation: AnimationType = 'float',
  referenceImage?: File,
  signal?: AbortSignal
): Promise<GenerationResult> {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('animation', animation);
  if (referenceImage) {
    formData.append('reference_image', referenceImage);
  }

  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { accept: 'application/json' },
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate sticker: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url };
}

// Free Animation Generator
export async function generateFreeAnimation(
  concept: string,
  frames: number = 2,
  signal?: AbortSignal
): Promise<GenerationResult> {
  const params = new URLSearchParams({ concept, frames: frames.toString() });
  const response = await fetch(`${API_BASE_URL}/generate-free-animation?${params}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate animation: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url };
}

// Replicate Animation Generator
export async function generateReplicateAnimation(
  concept: string,
  frames: number = 2,
  signal?: AbortSignal
): Promise<GenerationResult> {
  const params = new URLSearchParams({ concept, frames: frames.toString() });
  const response = await fetch(`${API_BASE_URL}/generate-replicate-animation?${params}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate animation: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url };
}

// Gemini Animation Generator
export async function generateGeminiAnimation(
  concept: string,
  frames: number = 2,
  referenceImage?: File,
  signal?: AbortSignal
): Promise<GenerationResult> {
  const formData = new FormData();
  formData.append('concept', concept);
  formData.append('frames', frames.toString());
  if (referenceImage) {
    formData.append('reference_image', referenceImage);
  }

  const response = await fetch(`${API_BASE_URL}/generate-gemni-animation`, {
    method: 'POST',
    headers: { accept: 'application/json' },
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate animation: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url };
}

// Premium Video Generator - Step 1
export async function generatePremiumVideo(prompt: string, signal?: AbortSignal): Promise<GenerationResult> {
  const response = await fetch(`${API_BASE_URL}/generate-video-original-by-video-model`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate video: ${response.statusText}`);
  }

  const taskId = response.headers.get('x-task-id') || undefined;
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url, taskId };
}

// Premium Video Generator - Step 2 (Get Transparent Version)
export async function getTransparentVideo(taskId: string, signal?: AbortSignal): Promise<GenerationResult> {
  const response = await fetch(`${API_BASE_URL}/get-transparent-video-by-video-model/${taskId}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to get transparent video: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  return { blob, url };
}

// History management
const HISTORY_KEY = 'sticker-generator-history';
const MAX_HISTORY_ITEMS = 20;

export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const items = JSON.parse(stored);
    return items.map((item: HistoryItem) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };
  
  const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
