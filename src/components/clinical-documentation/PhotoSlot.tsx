'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PhotoType } from '@/types';
import { removeBackground } from '@/lib/backgroundRemoval';

export interface PhotoSlotProps {
  type: PhotoType;
  photo: File | string | null;
  onCapture: (file: File) => void;
  onRemove: () => void;
  required?: boolean;
  disabled?: boolean;
  guideImageSrc?: string;
}

const PHOTO_LABELS: Record<PhotoType, string> = {
  'frontal': 'Frontal',
  'left-profile': 'Left Profile',
  'right-profile': 'Right Profile',
};

const PHOTO_DESCRIPTIONS: Record<PhotoType, string> = {
  'frontal': 'Full face, looking straight at the camera',
  'left-profile': 'Left side of face, 90° angle',
  'right-profile': 'Right side of face, 90° angle',
};

export function PhotoSlot({
  type,
  photo,
  onCapture,
  onRemove,
  required = false,
  disabled = false,
  guideImageSrc,
}: PhotoSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // For portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate preview URL for File objects
  useEffect(() => {
    if (photo instanceof File) {
      const url = URL.createObjectURL(photo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof photo === 'string') {
      setPreviewUrl(photo);
    } else {
      setPreviewUrl(null);
    }
  }, [photo]);

  /**
   * Calculate estimated processing time based on file size
   * 0.2MB = 5s, 4MB+ = 12s, linear in between
   */
  const getEstimatedDuration = (fileSizeBytes: number): number => {
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    const minSize = 0.2; // MB
    const maxSize = 4; // MB
    const minTime = 5000; // ms
    const maxTime = 12000; // ms

    if (fileSizeMB <= minSize) return minTime;
    if (fileSizeMB >= maxSize) return maxTime;

    // Linear interpolation
    const ratio = (fileSizeMB - minSize) / (maxSize - minSize);
    return minTime + ratio * (maxTime - minTime);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Start processing
    setIsProcessing(true);
    setProcessingProgress(0);

    // Calculate estimated duration and set up smooth progress animation
    const estimatedDuration = getEstimatedDuration(file.size);
    const updateInterval = 100; // Update every 100ms
    const totalSteps = estimatedDuration / updateInterval;
    const targetProgress = 0.9; // Animate to 90%, jump to 100% on completion
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      // Use easeOutQuad for smoother feel
      const linearProgress = currentStep / totalSteps;
      const easedProgress = linearProgress * (2 - linearProgress); // easeOutQuad
      const progress = Math.min(easedProgress * targetProgress, targetProgress);
      setProcessingProgress(progress);

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
      }
    }, updateInterval);

    try {
      const processedFile = await removeBackground(file);
      clearInterval(progressInterval);
      setProcessingProgress(1); // Jump to 100%

      // Small delay to show 100% before hiding
      await new Promise(resolve => setTimeout(resolve, 200));
      onCapture(processedFile);
    } catch (error) {
      console.error('Background removal failed:', error);
      clearInterval(progressInterval);
      // Fallback: use original image if processing fails
      onCapture(file);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleClick = () => {
    if (!disabled && !photo && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleRetake = () => {
    onRemove();
    // Small delay to allow state to update before opening file picker
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-stone-900">
          {PHOTO_LABELS[type]}
        </h4>
        {required ? (
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            Required
          </span>
        ) : (
          <span className="text-xs text-stone-400">
            Optional
          </span>
        )}
      </div>

      {/* Photo Area */}
      <div
        onClick={handleClick}
        className={`
          relative aspect-[3/4] rounded-xl overflow-hidden
          ${photo
            ? 'border-2 border-purple-500'
            : 'border-2 border-dashed border-stone-300 hover:border-stone-400'
          }
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : photo ? 'cursor-default' : 'cursor-pointer'}
          transition-colors bg-stone-50
        `}
      >
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-20 bg-white/95 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="animate-spin h-10 w-10 border-[3px] border-purple-600 border-t-transparent rounded-full mb-3" />
              <p className="text-sm font-medium text-stone-700 text-center">Removing background...</p>
              <p className="text-xs text-stone-500 mt-1 text-center">
                {Math.round(processingProgress * 100)}%
              </p>
            </div>
          </div>
        )}

        {previewUrl ? (
          // Photo Preview
          <div className="absolute inset-0">
            <img
              src={previewUrl}
              alt={`${PHOTO_LABELS[type]} photo`}
              className="w-full h-full object-cover"
            />
            {/* Overlay with actions */}
            {!disabled && !isProcessing && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* View button - Eye icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullscreen(true);
                  }}
                  className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-stone-100 transition-colors"
                  title="View"
                >
                  <svg className="h-5 w-5 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                {/* Retake button - Camera with refresh */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRetake();
                  }}
                  className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-stone-100 transition-colors"
                  title="Retake"
                >
                  <svg className="h-5 w-5 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                </button>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-red-50 transition-colors"
                  title="Remove"
                >
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            )}
            {/* Check badge */}
            {!isProcessing && (
              <div className="absolute top-3 right-3">
                <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="absolute inset-0">
            {guideImageSrc && !isProcessing ? (
              <>
                <img
                  src={guideImageSrc}
                  alt={`${PHOTO_LABELS[type]} guide`}
                  className="w-full h-full object-cover"
                />
                {/* Simple text overlay at bottom */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <span className="text-white text-sm font-medium drop-shadow-lg">
                    Tap to capture
                  </span>
                </div>
              </>
            ) : !isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="h-12 w-12 rounded-full bg-stone-200 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M17 9h.01" />
                  </svg>
                </div>
                <p className="text-sm text-stone-500 text-center">
                  {PHOTO_DESCRIPTIONS[type]}
                </p>
                <p className="text-xs text-stone-400 mt-2">
                  Click to upload or capture
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hidden file input - allows camera or photo library selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isProcessing}
        />
      </div>

      {/* Image Preview Modal - rendered via portal */}
      {mounted && showFullscreen && previewUrl && createPortal(
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setShowFullscreen(false)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
              <span className="text-sm font-medium text-stone-900">
                {PHOTO_LABELS[type]}
              </span>
              <button
                type="button"
                onClick={() => setShowFullscreen(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <svg className="h-5 w-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image - height constrained, width follows aspect ratio */}
            <div className="bg-stone-100 flex items-center justify-center">
              <img
                src={previewUrl}
                alt={`${PHOTO_LABELS[type]} photo`}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
