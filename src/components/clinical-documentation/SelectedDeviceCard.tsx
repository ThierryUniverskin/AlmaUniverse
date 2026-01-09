'use client';

import React from 'react';
import { SelectedEBDDevice } from '@/types';
import { getEBDDeviceById, getFitzpatrickColor, getDowntimeColor } from '@/lib/ebdDevices';

export interface SelectedDeviceCardProps {
  device: SelectedEBDDevice;
  onUpdate: (device: SelectedEBDDevice) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function SelectedDeviceCard({
  device,
  onUpdate,
  onRemove,
  disabled = false,
}: SelectedDeviceCardProps) {
  const ebdDevice = getEBDDeviceById(device.deviceId);
  const deviceName = ebdDevice?.name ?? device.deviceId;

  const handleDecrement = () => {
    const currentCount = device.sessionCount ?? 1;
    if (currentCount > 1) {
      onUpdate({ ...device, sessionCount: currentCount - 1 });
    }
  };

  const handleIncrement = () => {
    const currentCount = device.sessionCount ?? 1;
    onUpdate({ ...device, sessionCount: currentCount + 1 });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...device, notes: e.target.value });
  };

  const fitzColors = ebdDevice ? getFitzpatrickColor(ebdDevice.fitzpatrick) : { bg: 'bg-stone-50', text: 'text-stone-700' };
  const downtimeColors = ebdDevice ? getDowntimeColor(ebdDevice.downtime) : { bg: 'bg-stone-50', text: 'text-stone-700' };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
      <div className="flex gap-4">
        {/* Device Image */}
        <div className="flex-shrink-0">
          <div className="w-20 h-[133px] rounded-lg overflow-hidden bg-white border border-stone-200">
            <img
              src={ebdDevice?.imageUrl || `/images/ebd/${device.deviceId}.webp`}
              alt={deviceName}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = '/images/ebd-placeholder.webp'; }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with device name and remove button */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-stone-900 leading-tight">
              {deviceName}
            </h3>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="flex-shrink-0 p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              aria-label={`Remove ${deviceName}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          {ebdDevice?.description && (
            <p className="text-[11px] text-stone-500 mb-2">
              {ebdDevice.description}
            </p>
          )}

          {/* Fitzpatrick and Downtime badges */}
          {ebdDevice && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${fitzColors.bg} ${fitzColors.text}`}>
                Fitz {ebdDevice.fitzpatrick}
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${downtimeColors.bg} ${downtimeColors.text}`}>
                {ebdDevice.downtime === 'None' ? 'No' : ebdDevice.downtime} Downtime
              </span>
            </div>
          )}

          {/* Treats - as tags */}
          {ebdDevice && ebdDevice.treats.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ebdDevice.treats.map((treat, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-600 rounded"
                >
                  {treat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-100 pt-3 space-y-3">
        {/* Session Count and Notes in a row */}
        <div className="flex items-start gap-4">
          {/* Session Count - Compact quantity selector */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1.5">
              Sessions
            </label>
            <div className="inline-flex items-center border border-stone-200 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || (device.sessionCount ?? 1) <= 1}
                className="flex items-center justify-center w-7 h-7 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease sessions"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M5 12h14" />
                </svg>
              </button>
              <div className="w-8 h-7 flex items-center justify-center border-x border-stone-200 bg-white">
                <span className="text-xs font-semibold text-stone-900">
                  {device.sessionCount ?? 1}
                </span>
              </div>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled}
                className="flex items-center justify-center w-7 h-7 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase sessions"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notes - Takes remaining space */}
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1.5">
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={device.notes}
              onChange={handleNotesChange}
              disabled={disabled}
              placeholder="Add notes..."
              rows={1}
              className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-md resize-none
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       disabled:bg-stone-50 disabled:text-stone-400
                       placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
