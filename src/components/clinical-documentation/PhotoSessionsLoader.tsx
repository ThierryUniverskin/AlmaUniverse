'use client';

import React, { useState, useCallback } from 'react';
import { PhotoSession } from '@/types';
import { getPhotoSessions, getSignedUrl } from '@/lib/photoSession';

export interface PhotoSessionsLoaderProps {
  patientId: string;
  onLoadSession: (session: PhotoSession) => void;
  disabled?: boolean;
}

export function PhotoSessionsLoader({
  patientId,
  onLoadSession,
  disabled = false,
}: PhotoSessionsLoaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PhotoSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    // Expand and fetch if not already loaded
    setIsExpanded(true);

    if (sessions === null) {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPhotoSessions(patientId);
        // Filter to sessions that have at least one photo and limit to 5
        const sessionsWithPhotos = data
          .filter(s => s.frontalPhotoUrl || s.leftProfilePhotoUrl || s.rightProfilePhotoUrl)
          .slice(0, 5);
        setSessions(sessionsWithPhotos);
      } catch (err) {
        console.error('[PhotoSessionsLoader] Error fetching sessions:', err);
        setError('Failed to load previous sessions');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isExpanded, sessions, patientId]);

  const handleLoadSession = async (session: PhotoSession) => {
    setIsLoadingSession(session.id);

    try {
      // Convert storage paths to signed URLs
      const [frontalUrl, leftUrl, rightUrl] = await Promise.all([
        session.frontalPhotoUrl ? getSignedUrl(session.frontalPhotoUrl) : null,
        session.leftProfilePhotoUrl ? getSignedUrl(session.leftProfilePhotoUrl) : null,
        session.rightProfilePhotoUrl ? getSignedUrl(session.rightProfilePhotoUrl) : null,
      ]);

      // Create session with signed URLs
      const sessionWithUrls: PhotoSession = {
        ...session,
        frontalPhotoUrl: frontalUrl,
        leftProfilePhotoUrl: leftUrl,
        rightProfilePhotoUrl: rightUrl,
      };

      onLoadSession(sessionWithUrls);
      setIsExpanded(false);
    } catch (err) {
      console.error('[PhotoSessionsLoader] Error loading session:', err);
    } finally {
      setIsLoadingSession(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render photo availability indicator
  const PhotoIndicator = ({ hasPhoto, label }: { hasPhoto: boolean; label: string }) => (
    <span className="inline-flex items-center gap-1 text-xs text-stone-500">
      <span className={hasPhoto ? 'text-purple-500' : 'text-stone-300'}>
        {hasPhoto ? '●' : '○'}
      </span>
      {label}
    </span>
  );

  return (
    <div className="mb-4">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3
          bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg
          text-sm text-stone-600 hover:text-stone-800
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Load from previous session</span>
        </div>
        <svg
          className={`h-4 w-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-2 border border-stone-200 rounded-lg bg-white overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-center text-sm text-stone-500">
              {error}
            </div>
          ) : sessions && sessions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-stone-500">
              No previous photo sessions found
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {sessions?.map((session) => (
                <div
                  key={session.id}
                  className="px-4 py-3 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-700">
                        {formatDate(session.createdAt)}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <PhotoIndicator hasPhoto={!!session.frontalPhotoUrl} label="Frontal" />
                        <PhotoIndicator hasPhoto={!!session.rightProfilePhotoUrl} label="Right" />
                        <PhotoIndicator hasPhoto={!!session.leftProfilePhotoUrl} label="Left" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadSession(session)}
                      disabled={disabled || isLoadingSession !== null}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-50 min-w-[52px]"
                    >
                      {isLoadingSession === session.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mx-auto" />
                      ) : (
                        'Load'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
