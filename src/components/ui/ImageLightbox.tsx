'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarOffset } from '@/context/LayoutContext';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/**
 * Full-screen lightbox for viewing images at larger size.
 * Click backdrop or X button to close.
 */
export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const sidebarOffset = useSidebarOffset();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-[padding] duration-300"
      style={{ paddingLeft: sidebarOffset }}
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
