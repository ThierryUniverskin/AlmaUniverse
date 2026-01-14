'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebarOffset } from '@/context/LayoutContext';
import { FlowerVisualization } from './FlowerVisualization';
import { CategoryDetailModal } from './CategoryDetailModal';
import { SkinWellnessStepProgress } from './SkinWellnessStepProgress';
import { Button } from '@/components/ui/Button';
import { SkinAnalysisResult, ImageQualityAssessment, PatientAttributes } from '@/lib/skinWellnessCategories';

/**
 * SkinWellnessResults - Results overview screen
 *
 * Displays the flower visualization with mandatory disclaimer and navigation buttons.
 * Uses SkinXS sky blue theme throughout.
 */

interface SkinWellnessResultsProps {
  results: SkinAnalysisResult[];
  patientId: string;
  onBack?: () => void;
  photoUrls?: {
    frontal: string | null;
    left: string | null;
    right: string | null;
  };
  patientName?: string | null;
  sessionDate?: string | null;
  skinHealthOverview?: string | null;
  imageQuality?: ImageQualityAssessment | null;
  patientAttributes?: PatientAttributes | null;
}

/**
 * Get color class for image quality score
 * Green (8+): Excellent
 * Yellow/Amber (6-7): Good
 * Orange (4-5): Needs improvement
 * Red (<4): Poor quality
 */
function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 8) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
  if (score >= 6) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
  if (score >= 4) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
  return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
}

export function SkinWellnessResults({ results: initialResults, patientId, onBack, photoUrls, patientName, sessionDate, skinHealthOverview, imageQuality, patientAttributes: initialAttributes }: SkinWellnessResultsProps) {
  const router = useRouter();
  const { state: authState } = useAuth();
  const sidebarOffset = useSidebarOffset();
  const [results, setResults] = useState<SkinAnalysisResult[]>(initialResults);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
  const [detailModalCategory, setDetailModalCategory] = useState<string | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [showImageQualityModal, setShowImageQualityModal] = useState(false);
  const [attributes, setAttributes] = useState<PatientAttributes | null>(initialAttributes || null);
  const [isEditingAttributes, setIsEditingAttributes] = useState(false);
  const [overviewText, setOverviewText] = useState(skinHealthOverview || '');
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const scoreColors = imageQuality ? getScoreColor(imageQuality.qualityScore) : null;

  // Helper to update a single attribute
  const updateAttribute = <K extends keyof PatientAttributes>(key: K, value: PatientAttributes[K]) => {
    if (attributes) {
      setAttributes({ ...attributes, [key]: value });
    }
  };

  // Regenerate overview text (mock - in production this would call AI)
  const handleRegenerateOverview = () => {
    setIsRegenerating(true);
    // Simulate AI regeneration delay
    setTimeout(() => {
      // In v1, just generate a new mock overview
      const overviews = [
        "Your skin appears generally healthy and well-maintained, with good overall radiance and hydration. Some mild variations in texture and tone are visible, which are common and can be addressed with consistent skincare.",
        "Overall, your skin displays a healthy foundation with balanced hydration levels. Some visible texture and mild blemishes are present, which are typical and treatable.",
        "Your complexion shows good underlying health with adequate moisture levels. There are some areas of visible texture and subtle tone variations that could benefit from attention.",
        "Your skin presents with a healthy baseline and natural luminosity. Some mild surface irregularities and subtle redness are visible, which are common concerns.",
      ];
      const randomOverview = overviews[Math.floor(Math.random() * overviews.length)];
      setOverviewText(randomOverview);
      setIsRegenerating(false);
    }, 1500);
  };

  // Format date for display
  const formattedDate = sessionDate
    ? new Date(sessionDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleContinueToSkincare = () => {
    // v1: Navigate to patient page (future: skincare recommendations)
    router.push(`/patients/${patientId}`);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate back to clinical documentation - sessionStorage has the saved state
      router.push('/clinical-documentation/new');
    }
  };

  return (
    <div
      className="min-h-full relative bg-gradient-to-b from-sky-100 via-sky-50 to-sky-50/50"
      onClick={() => setActiveSlice(null)}
    >
      {/* Top bar with doctor name (left) and step progress (right) */}
      <div className="absolute top-6 left-6 right-6 lg:top-8 lg:left-10 lg:right-10 z-10 flex items-center justify-between">
        {/* Doctor name with avatar */}
        <div className="flex items-center gap-2.5">
          {authState.doctor && (
            <>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-sky-700">
                  {authState.doctor.firstName[0]}{authState.doctor.lastName[0]}
                </span>
              </div>
              <span className="text-sm font-medium text-stone-600">
                {authState.doctor.title ? `${authState.doctor.title} ` : ''}{authState.doctor.firstName} {authState.doctor.lastName}
              </span>
            </>
          )}
        </div>

        {/* Step Progress with frosted glass */}
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-sky-100">
          <SkinWellnessStepProgress currentStep={2} />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-8">
        {/* Header */}
        <div className="mb-6">
          {/* Centered logo */}
          <div className="flex items-center justify-center mb-3">
            <img
              src="/images/skinxs-logo.svg"
              alt="SkinXS"
              className="h-12 w-auto"
            />
          </div>
          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-stone-800 mb-1">
              Cosmetic Skin Appearance Overview
            </h1>
            <p className="text-sm text-stone-400">
              Based on visible skin appearance only
            </p>
          </div>
        </div>

        {/* Patient Info Card */}
        {(patientName || formattedDate || (photoUrls && (photoUrls.frontal || photoUrls.left || photoUrls.right))) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm p-5 mb-4 animate-fade-in">
            <div className="flex items-center gap-5">
              {/* Photo Thumbnails - Order: Frontal, Right, Left */}
              {photoUrls && (photoUrls.frontal || photoUrls.left || photoUrls.right) && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {photoUrls.frontal && (
                    <div
                      className="cursor-pointer group"
                      onClick={(e) => { e.stopPropagation(); setEnlargedPhoto(photoUrls.frontal); }}
                    >
                      <img
                        src={photoUrls.frontal}
                        alt="Frontal"
                        className="w-16 h-16 object-cover rounded-xl border-2 border-sky-300 shadow-md group-hover:border-sky-500 group-hover:shadow-lg transition-all"
                      />
                    </div>
                  )}
                  {photoUrls.right && (
                    <div
                      className="cursor-pointer group"
                      onClick={(e) => { e.stopPropagation(); setEnlargedPhoto(photoUrls.right); }}
                    >
                      <img
                        src={photoUrls.right}
                        alt="Right profile"
                        className="w-16 h-16 object-cover rounded-xl border-2 border-sky-300 shadow-md group-hover:border-sky-500 group-hover:shadow-lg transition-all"
                      />
                    </div>
                  )}
                  {photoUrls.left && (
                    <div
                      className="cursor-pointer group"
                      onClick={(e) => { e.stopPropagation(); setEnlargedPhoto(photoUrls.left); }}
                    >
                      <img
                        src={photoUrls.left}
                        alt="Left profile"
                        className="w-16 h-16 object-cover rounded-xl border-2 border-sky-300 shadow-md group-hover:border-sky-500 group-hover:shadow-lg transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Patient Info & Image Quality */}
              <div className="flex-1 min-w-0">
                {patientName && (
                  <p className="text-lg font-semibold text-stone-800 truncate">{patientName}</p>
                )}
                {formattedDate && (
                  <p className="text-sm text-stone-500 flex items-center gap-1.5 mb-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {formattedDate}
                  </p>
                )}
                {/* Image Quality Score */}
                {imageQuality && scoreColors && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowImageQualityModal(true); }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${scoreColors.bg} border ${scoreColors.border} hover:opacity-80 transition-opacity`}
                  >
                    <svg className={`w-3.5 h-3.5 ${scoreColors.text}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <span className={`text-xs font-medium ${scoreColors.text}`}>
                      Image Quality Score <span className="font-bold">{imageQuality.qualityScore}/10</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Patient Attributes Card */}
        {attributes && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm p-5 mb-4 animate-fade-in overflow-visible relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-700">Patient Attributes</h3>
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditingAttributes(!isEditingAttributes); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  isEditingAttributes
                    ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                    : 'text-stone-500 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                {isEditingAttributes ? (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Done
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                    Edit
                  </>
                )}
              </button>
            </div>

            {isEditingAttributes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AttributeSelect
                  label="Gender"
                  value={attributes.gender}
                  onChange={(v) => updateAttribute('gender', v as PatientAttributes['gender'])}
                  options={[
                    { value: 'female', label: 'Female' },
                    { value: 'male', label: 'Male' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <AttributeSelect
                  label="Eye Color"
                  value={attributes.eyeColor}
                  onChange={(v) => updateAttribute('eyeColor', v as PatientAttributes['eyeColor'])}
                  options={[
                    { value: 'brown', label: 'Brown' },
                    { value: 'blue', label: 'Blue' },
                    { value: 'green', label: 'Green' },
                    { value: 'hazel', label: 'Hazel' },
                    { value: 'gray', label: 'Gray' },
                    { value: 'amber', label: 'Amber' },
                  ]}
                />
                <AttributeSelect
                  label="Fitzpatrick Type"
                  value={attributes.fitzpatrickType}
                  onChange={(v) => updateAttribute('fitzpatrickType', v as PatientAttributes['fitzpatrickType'])}
                  options={[
                    { value: 'I', label: 'Type I - Very Fair' },
                    { value: 'II', label: 'Type II - Fair' },
                    { value: 'III', label: 'Type III - Medium' },
                    { value: 'IV', label: 'Type IV - Olive' },
                    { value: 'V', label: 'Type V - Brown' },
                    { value: 'VI', label: 'Type VI - Dark' },
                  ]}
                />
                <AttributeSelect
                  label="Skin Thickness"
                  value={attributes.skinThickness}
                  onChange={(v) => updateAttribute('skinThickness', v as PatientAttributes['skinThickness'])}
                  options={[
                    { value: 'thin', label: 'Thin' },
                    { value: 'thick', label: 'Thick' },
                  ]}
                />
                <AttributeSelect
                  label="Skin Type"
                  value={attributes.skinType}
                  onChange={(v) => updateAttribute('skinType', v as PatientAttributes['skinType'])}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'dry', label: 'Dry' },
                    { value: 'oily', label: 'Oily' },
                    { value: 'combination', label: 'Combination' },
                    { value: 'sensitive', label: 'Sensitive' },
                  ]}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AttributePill label="Gender" value={attributes.gender === 'female' ? 'Female' : attributes.gender === 'male' ? 'Male' : 'Other'} />
                <AttributePill label="Eyes" value={attributes.eyeColor.charAt(0).toUpperCase() + attributes.eyeColor.slice(1)} />
                <AttributePill label="Fitzpatrick" value={`Type ${attributes.fitzpatrickType}`} />
                <AttributePill label="Thickness" value={attributes.skinThickness.charAt(0).toUpperCase() + attributes.skinThickness.slice(1)} />
                <AttributePill label="Skin" value={attributes.skinType.charAt(0).toUpperCase() + attributes.skinType.slice(1)} />
              </div>
            )}
          </div>
        )}

        {/* Skin Health Overview Card */}
        {(skinHealthOverview || overviewText) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm p-5 mb-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stone-700">Overview of Skin Wellness</h3>
              <div className="flex items-center gap-1">
                {/* Regenerate button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRegenerateOverview(); }}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate based on analysis"
                >
                  <svg className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                  </svg>
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
                {/* Edit button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditingOverview(!isEditingOverview); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    isEditingOverview
                      ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                      : 'text-stone-500 hover:text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  {isEditingOverview ? (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Done
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                      </svg>
                      Edit
                    </>
                  )}
                </button>
              </div>
            </div>
            {isEditingOverview ? (
              <textarea
                value={overviewText}
                onChange={(e) => setOverviewText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-sm text-stone-600 leading-relaxed bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none"
                rows={4}
              />
            ) : (
              <p className="text-sm text-stone-600 leading-relaxed">
                {overviewText}
              </p>
            )}
          </div>
        )}

        {/* Flower Visualization Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm p-6 mb-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-sm font-semibold text-stone-700 mb-4">Skin Appearance Analysis</h3>
          <div className="flex flex-col items-center px-4 py-2">
            <FlowerVisualization
              results={results}
              size={640}
              editable={true}
              onResultsChange={setResults}
              activeSlice={activeSlice}
              onActiveSliceChange={setActiveSlice}
              onLabelClick={setDetailModalCategory}
            />
            {/* Instruction hint */}
            <p className="text-xs text-stone-400 mt-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
              Tap any segment to adjust
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 focus:ring-sky-500/30"
            onClick={handleContinueToSkincare}
          >
            Continue
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <p className="text-xs text-stone-400 text-center leading-relaxed">
            This overview describes the visibility of surface skin features.
            It does not diagnose, treat, prevent, or assess medical conditions.
          </p>
        </div>
      </div>

      {/* Category Detail Modal */}
      <CategoryDetailModal
        categoryId={detailModalCategory || ''}
        isOpen={detailModalCategory !== null}
        onClose={() => setDetailModalCategory(null)}
      />

      {/* Photo Lightbox Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-[padding] duration-300"
          style={{ paddingLeft: sidebarOffset }}
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <img
              src={enlargedPhoto}
              alt="Enlarged photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <svg className="w-6 h-6 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Image Quality Modal */}
      {showImageQualityModal && imageQuality && scoreColors && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-[padding] duration-300"
          style={{ paddingLeft: sidebarOffset }}
          onClick={() => setShowImageQualityModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.border} text-lg font-bold flex items-center justify-center`}>
                  {imageQuality.qualityScore}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-800">Image Quality</h3>
                  <p className="text-xs text-stone-500">Assessment of photo quality</p>
                </div>
              </div>
              <button
                onClick={() => setShowImageQualityModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)] space-y-4">
              {/* Summary */}
              <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                <p className="text-sm text-sky-800 leading-relaxed">{imageQuality.resultsSummary}</p>
              </div>

              {/* Quality Criteria */}
              <div className="space-y-3">
                <QualityCriterion icon="📷" label="Clarity" value={imageQuality.clearImage} />
                <QualityCriterion icon="💡" label="Lighting" value={imageQuality.lighting} />
                <QualityCriterion icon="🎯" label="Focus" value={imageQuality.focus} />
                <QualityCriterion icon="🎨" label="True Colors" value={imageQuality.trueColors} />
                <QualityCriterion icon="🖼️" label="Background" value={imageQuality.background} />
                <QualityCriterion icon="✨" label="Preparation" value={imageQuality.preparation} />
              </div>

              {/* Tips */}
              {imageQuality.tipsToImprove && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-medium text-amber-700 mb-1">Tips to Improve</p>
                  <p className="text-sm text-amber-800">{imageQuality.tipsToImprove}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QualityCriterion({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-medium text-stone-700 mb-0.5">{label}</p>
        <p className="text-sm text-stone-600 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

/**
 * AttributeSelect - Custom styled dropdown for skin wellness attributes
 * Uses sky blue theme to match the SkinXS branding
 */
interface AttributeSelectOption {
  value: string;
  label: string;
}

interface AttributeSelectProps {
  label: string;
  options: readonly AttributeSelectOption[];
  value: string;
  onChange: (value: string) => void;
}

function AttributePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-full">
      <span className="text-xs text-stone-500">{label}:</span>
      <span className="text-xs font-medium text-stone-700">{value}</span>
    </div>
  );
}

function AttributeSelect({ label, options, value, onChange }: AttributeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-50' : 'z-0'}`}>
      <label className="block text-xs font-medium text-stone-500 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2 text-sm text-left
          bg-white border border-stone-200 rounded-xl
          transition-all duration-150
          ${isOpen ? 'ring-2 ring-sky-400 border-transparent shadow-sm' : 'hover:border-sky-300 hover:shadow-sm'}
        `}
      >
        <span className="truncate text-stone-800 font-medium">{selectedOption?.label || 'Select...'}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-stone-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-[100] mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-48 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-sm text-left transition-colors flex items-center justify-between
                  ${option.value === value
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-stone-700 hover:bg-stone-50'
                  }
                `}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <svg className="w-4 h-4 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
