'use client';

import React, { useState, useEffect } from 'react';
import { getCategoryById } from '@/lib/skinWellnessCategories';
import { SkinWellnessDetail, getCategoryDetails } from '@/lib/skinWellnessDetails';

interface CategoryDetailModalProps {
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (categoryId: string, details: SkinWellnessDetail[]) => void;
}

export function CategoryDetailModal({
  categoryId,
  isOpen,
  onClose,
  onSave,
}: CategoryDetailModalProps) {
  const category = getCategoryById(categoryId);
  const initialDetails = getCategoryDetails(categoryId);
  const [details, setDetails] = useState<SkinWellnessDetail[]>(initialDetails);

  // Reset details when category changes
  useEffect(() => {
    setDetails(getCategoryDetails(categoryId));
  }, [categoryId]);

  if (!isOpen || !category) return null;

  const handleDescriptionChange = (key: string, newDescription: string) => {
    setDetails((prev) =>
      prev.map((detail) =>
        detail.key === key ? { ...detail, description: newDescription } : detail
      )
    );
  };

  const handleSave = () => {
    if (onSave) {
      onSave(categoryId, details);
    }
    onClose();
  };

  const handleCancel = () => {
    setDetails(initialDetails);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-stone-200 flex items-center gap-3"
          style={{ backgroundColor: category.color + '15' }}
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <h2 className="text-lg font-semibold text-stone-900">{category.name}</h2>
          <button
            onClick={handleCancel}
            className="ml-auto p-1 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {details.map((detail) => (
            <div key={detail.key} className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">
                {detail.label}
              </label>
              <textarea
                value={detail.description}
                onChange={(e) => handleDescriptionChange(detail.key, e.target.value)}
                className="w-full px-3 py-2 text-sm text-stone-700 border border-stone-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors"
                rows={3}
              />
            </div>
          ))}

          {details.length === 0 && (
            <p className="text-sm text-stone-500 text-center py-8">
              No detailed parameters available for this category.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
