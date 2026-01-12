'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { PhotoSession } from '@/types';
import { getPhotoSessions, getSignedUrl } from '@/lib/photoSession';
import { logger } from '@/lib/logger';

const SESSIONS_PER_PAGE = 3;

export interface PhotoSessionsLoaderProps {
  patientId: string;
  onLoadSession: (session: PhotoSession) => void;
  disabled?: boolean;
}

// Session with thumbnail URLs
interface SessionWithThumbnails extends PhotoSession {
  frontalThumbnailUrl?: string | null;
  leftThumbnailUrl?: string | null;
  rightThumbnailUrl?: string | null;
}

export function PhotoSessionsLoader({
  patientId,
  onLoadSession,
  disabled = false,
}: PhotoSessionsLoaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionWithThumbnails[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate pagination
  const totalSessions = sessions?.length || 0;
  const totalPages = Math.ceil(totalSessions / SESSIONS_PER_PAGE);
  const paginatedSessions = sessions?.slice(
    currentPage * SESSIONS_PER_PAGE,
    (currentPage + 1) * SESSIONS_PER_PAGE
  ) || [];

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
        // Filter to sessions that have at least one photo
        const sessionsWithPhotos = data
          .filter(s => s.frontalPhotoUrl || s.leftProfilePhotoUrl || s.rightProfilePhotoUrl);

        // Generate thumbnail URLs for each session
        const sessionsWithThumbnails: SessionWithThumbnails[] = await Promise.all(
          sessionsWithPhotos.map(async (session) => {
            const [frontalUrl, leftUrl, rightUrl] = await Promise.all([
              session.frontalPhotoUrl ? getSignedUrl(session.frontalPhotoUrl) : null,
              session.leftProfilePhotoUrl ? getSignedUrl(session.leftProfilePhotoUrl) : null,
              session.rightProfilePhotoUrl ? getSignedUrl(session.rightProfilePhotoUrl) : null,
            ]);
            return {
              ...session,
              frontalThumbnailUrl: frontalUrl,
              leftThumbnailUrl: leftUrl,
              rightThumbnailUrl: rightUrl,
            };
          })
        );

        setSessions(sessionsWithThumbnails);
      } catch (err) {
        logger.error('[PhotoSessionsLoader] Error fetching sessions:', err);
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
      logger.error('[PhotoSessionsLoader] Error loading session:', err);
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

  // Render photo thumbnail
  const PhotoThumbnail = ({ url, label }: { url: string | null | undefined; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-12 h-14 rounded-md overflow-hidden bg-stone-100 border border-stone-200">
        {url ? (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
      </div>
      <span className="text-[10px] text-stone-400 mt-0.5">{label}</span>
    </div>
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
            <>
              <div className="divide-y divide-stone-100">
                {paginatedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="px-4 py-3 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Photo thumbnails */}
                      <div className="flex gap-1.5">
                        <PhotoThumbnail url={session.frontalThumbnailUrl} label="Front" />
                        <PhotoThumbnail url={session.leftThumbnailUrl} label="Left" />
                        <PhotoThumbnail url={session.rightThumbnailUrl} label="Right" />
                      </div>

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-700">
                          {formatDate(session.createdAt)}
                        </div>
                        <div className="text-xs text-stone-400">
                          via {session.source === 'almaiq' ? 'AlmaIQ' : 'App'}
                        </div>
                      </div>

                      {/* Load button */}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-2 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    {totalSessions} session{totalSessions !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs text-stone-600 min-w-[3rem] text-center">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
