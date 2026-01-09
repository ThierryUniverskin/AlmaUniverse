'use client';

import React, { useState, useCallback } from 'react';
import { ClinicalEvaluationSession } from '@/types';
import { getClinicalEvaluations } from '@/lib/clinicalEvaluation';
import { getConcernById } from '@/lib/skinConcerns';

export interface PreviousSessionsLoaderProps {
  patientId: string;
  onLoadSession: (concerns: string[]) => void;
  disabled?: boolean;
}

export function PreviousSessionsLoader({
  patientId,
  onLoadSession,
  disabled = false,
}: PreviousSessionsLoaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ClinicalEvaluationSession[] | null>(null);
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
        const data = await getClinicalEvaluations(patientId);
        // Filter to only sessions with concerns and limit to 5
        const sessionsWithConcerns = data
          .filter(s => s.selectedSkinConcerns && s.selectedSkinConcerns.length > 0)
          .slice(0, 5);
        setSessions(sessionsWithConcerns);
      } catch (err) {
        console.error('[PreviousSessionsLoader] Error fetching sessions:', err);
        setError('Failed to load previous sessions');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isExpanded, sessions, patientId]);

  const handleLoadSession = (session: ClinicalEvaluationSession) => {
    onLoadSession(session.selectedSkinConcerns);
    setIsExpanded(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getConcernLabels = (concernIds: string[]): string => {
    const labels = concernIds
      .map(id => getConcernById(id)?.label)
      .filter(Boolean);

    if (labels.length === 0) return 'No concerns';
    if (labels.length <= 3) return labels.join(', ');
    return `${labels.slice(0, 3).join(', ')} +${labels.length - 3} more`;
  };

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
              No previous sessions with skin concerns found
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
                      <div className="text-xs text-stone-500 mt-0.5 truncate">
                        {getConcernLabels(session.selectedSkinConcerns)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadSession(session)}
                      disabled={disabled}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-50"
                    >
                      Load
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
