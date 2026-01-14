'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SKIN_WELLNESS_CATEGORIES } from '@/lib/skinWellnessCategories';
import { SkinWellnessStepProgress } from './SkinWellnessStepProgress';

/**
 * SkinAnalysisLoading - Premium animation screen for skin wellness analysis
 *
 * Renders within the dashboard layout (not full screen).
 * Displays for exactly 10 seconds with premium visual effects.
 */

interface SkinAnalysisLoadingProps {
  photoUrl: string | null;
  onComplete: () => void;
}

const ANALYSIS_DURATION = 10000;
const CATEGORY_CYCLE_INTERVAL = 1000;

const PARTICLE_POSITIONS = [
  { left: '10%', delay: '0s', size: 3 },
  { left: '25%', delay: '0.8s', size: 2 },
  { left: '40%', delay: '1.6s', size: 4 },
  { left: '55%', delay: '0.4s', size: 2 },
  { left: '70%', delay: '1.2s', size: 3 },
  { left: '85%', delay: '2s', size: 2 },
  { left: '95%', delay: '0.6s', size: 3 },
];

export function SkinAnalysisLoading({ photoUrl, onComplete }: SkinAnalysisLoadingProps) {
  const { state: authState } = useAuth();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Progress tracking for blur effect
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / ANALYSIS_DURATION, 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % SKIN_WELLNESS_CATEGORIES.length);
    }, CATEGORY_CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 300);
    }, ANALYSIS_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const currentCategory = SKIN_WELLNESS_CATEGORIES[currentCategoryIndex];

  // Progress percentage for ring
  const progressPercent = Math.round(progress * 100);
  const circumference = 2 * Math.PI * 42; // radius = 42
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className={`min-h-full relative overflow-hidden transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: `linear-gradient(to bottom,
          color-mix(in srgb, ${currentCategory.color} 8%, #e0f2fe) 0%,
          color-mix(in srgb, ${currentCategory.color} 4%, #f0f9ff) 50%,
          #ffffff 100%)`,
        transition: 'background 1s ease-in-out',
      }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${currentCategory.color}15 0%, transparent 60%)`,
          transition: 'background 1s ease-in-out',
        }}
      />

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
          <SkinWellnessStepProgress currentStep={1} />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-2xl mx-auto p-8 pt-20 lg:pt-24">
        {/* Logo with Progress Ring */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Progress Ring */}
            <svg className="absolute -inset-5 w-[calc(100%+40px)] h-[calc(100%+40px)]" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-stone-200"
              />
              {/* Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={currentCategory.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  filter: `drop-shadow(0 0 4px ${currentCategory.color}60)`,
                }}
              />
            </svg>
            <img
              src="/images/skinxs-logo.svg"
              alt="SkinXS"
              className="h-12 w-auto relative z-10"
            />
          </div>
        </div>

        {/* Photo Container */}
        <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[4/5] max-h-[500px] mx-auto shadow-xl border border-white/50">
          {/* Pulsing glow behind photo */}
          <div
            className="absolute -inset-4 rounded-3xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${currentCategory.color}30 0%, transparent 70%)`,
              animation: 'pulseGlow 3s ease-in-out infinite',
              transition: 'background 1s ease-in-out',
            }}
          />

          {/* Photo Layer with Slow Zoom */}
          {photoUrl ? (
            <div className="absolute inset-0 animate-slow-zoom">
              <img
                src={photoUrl}
                alt="Patient photo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-sky-200" />
          )}

          {/* Subtle vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)',
            }}
          />

          {/* Scanning Beam - sweeps left to right */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 bottom-0 left-0 w-1"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${currentCategory.color}80 20%, ${currentCategory.color} 50%, ${currentCategory.color}80 80%, transparent 100%)`,
                boxShadow: `0 0 20px 8px ${currentCategory.color}60, 0 0 40px 16px ${currentCategory.color}30`,
                animation: 'scanBeam 5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {PARTICLE_POSITIONS.map((particle, index) => (
              <div
                key={index}
                className="absolute bottom-0 rounded-full bg-white/60"
                style={{
                  left: particle.left,
                  width: particle.size,
                  height: particle.size,
                  animation: `floatParticle 4s ease-out infinite`,
                  animationDelay: particle.delay,
                  boxShadow: `0 0 ${particle.size * 2}px ${currentCategory.color}60`,
                }}
              />
            ))}
          </div>

          {/* Enhanced Corner Frames */}
          <div className="absolute inset-3 pointer-events-none">
            {/* Top Left */}
            <div className="absolute top-0 left-0 w-12 h-12">
              <div
                className="absolute top-0 left-0 w-full h-0.5 bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite' }}
              />
              <div
                className="absolute top-0 left-0 w-0.5 h-full bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite', animationDelay: '0.1s' }}
              />
              {/* Corner accent */}
              <div
                className="absolute top-0 left-0 w-2 h-2 rounded-br"
                style={{
                  backgroundColor: `${currentCategory.color}60`,
                  boxShadow: `0 0 8px ${currentCategory.color}40`,
                }}
              />
            </div>
            {/* Top Right */}
            <div className="absolute top-0 right-0 w-12 h-12">
              <div
                className="absolute top-0 right-0 w-full h-0.5 bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite', animationDelay: '0.2s' }}
              />
              <div
                className="absolute top-0 right-0 w-0.5 h-full bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite', animationDelay: '0.3s' }}
              />
              <div
                className="absolute top-0 right-0 w-2 h-2 rounded-bl"
                style={{
                  backgroundColor: `${currentCategory.color}60`,
                  boxShadow: `0 0 8px ${currentCategory.color}40`,
                }}
              />
            </div>
            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-12 h-12">
              <div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite', animationDelay: '0.4s' }}
              />
              <div
                className="absolute bottom-0 left-0 w-0.5 h-full bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite', animationDelay: '0.5s' }}
              />
              <div
                className="absolute bottom-0 left-0 w-2 h-2 rounded-tr"
                style={{
                  backgroundColor: `${currentCategory.color}60`,
                  boxShadow: `0 0 8px ${currentCategory.color}40`,
                }}
              />
            </div>
            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-12 h-12">
              <div
                className="absolute bottom-0 right-0 w-full h-0.5 bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite', animationDelay: '0.6s' }}
              />
              <div
                className="absolute bottom-0 right-0 w-0.5 h-full bg-white/80"
                style={{ animation: 'cornerPulse 2s ease-in-out infinite', animationDelay: '0.7s' }}
              />
              <div
                className="absolute bottom-0 right-0 w-2 h-2 rounded-tl"
                style={{
                  backgroundColor: `${currentCategory.color}60`,
                  boxShadow: `0 0 8px ${currentCategory.color}40`,
                }}
              />
            </div>
          </div>

          {/* CSS Animations */}
          <style jsx>{`
            @keyframes scanBeam {
              0% { left: 0%; opacity: 0; }
              3% { opacity: 1; }
              47% { opacity: 1; }
              50% { left: 100%; opacity: 0; }
              53% { opacity: 1; }
              97% { opacity: 1; }
              100% { left: 0%; opacity: 0; }
            }
            @keyframes pulseGlow {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.02); }
            }
            @keyframes floatParticle {
              0% { transform: translateY(0) translateX(0); opacity: 0; }
              10% { opacity: 0.8; }
              90% { opacity: 0.8; }
              100% { transform: translateY(-400px) translateX(20px); opacity: 0; }
            }
            @keyframes cornerPulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>

        {/* Content Below Photo */}
        <div className="text-center">
          {/* Header */}
          <h1 className="text-xl font-semibold text-stone-700 mb-2">
            Skin Wellness Mode
          </h1>

          {/* Status with progress */}
          <p className="text-stone-500 mb-4">
            Analysing skin appearance... <span className="font-medium" style={{ color: currentCategory.color }}>{progressPercent}%</span>
          </p>

          {/* Cycling Category */}
          <div className="h-6 flex items-center justify-center mb-4">
            <p
              key={currentCategoryIndex}
              className="text-sm font-medium animate-text-cycle"
              style={{ color: currentCategory.color }}
            >
              Observing {currentCategory.name}...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-48 h-1.5 bg-stone-200 rounded-full overflow-hidden mx-auto mb-4">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentCategoryIndex + 1) / SKIN_WELLNESS_CATEGORIES.length) * 100}%`,
                backgroundColor: currentCategory.color,
                boxShadow: `0 0 8px ${currentCategory.color}60`,
              }}
            />
          </div>

          {/* Footer */}
          <p className="text-sm text-stone-400 max-w-sm mx-auto">
            Evaluating visible surface features for cosmetic skin wellness.
          </p>
        </div>
      </div>
    </div>
  );
}
