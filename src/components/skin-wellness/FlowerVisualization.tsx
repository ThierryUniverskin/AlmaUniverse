'use client';

import React, { useState } from 'react';
import {
  SKIN_WELLNESS_CATEGORIES,
  SkinAnalysisResult,
  VisibilityLevel,
} from '@/lib/skinWellnessCategories';

/**
 * FlowerVisualization - Radial flower chart matching the exact design
 *
 * Structure:
 * - 10 equal wedge segments (36° each)
 * - Each segment has: pale pink outer background + colored inner wedge (same shape)
 * - Inner wedge LENGTH varies by visibility (5 discrete levels)
 * - Labels inside the outer pale area
 */

interface FlowerVisualizationProps {
  results: SkinAnalysisResult[];
  size?: number;
  editable?: boolean;
  onResultsChange?: (results: SkinAnalysisResult[]) => void;
  activeSlice?: string | null;
  onActiveSliceChange?: (sliceId: string | null) => void;
  onLabelClick?: (categoryId: string) => void;
}

const SEGMENT_COUNT = 10;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

// 11 discrete length levels (0-10) as percentage of outer radius
// Linear interpolation from 0.15 at level 0 to 0.92 at level 10
function getVisibilityLength(level: VisibilityLevel): number {
  const minLength = 0.15;
  const maxLength = 0.92;
  return minLength + (level / 10) * (maxLength - minLength);
}

export function FlowerVisualization({
  results,
  size = 900,
  editable = false,
  onResultsChange,
  activeSlice: controlledActiveSlice,
  onActiveSliceChange,
  onLabelClick,
}: FlowerVisualizationProps) {
  const [internalActiveSlice, setInternalActiveSlice] = useState<string | null>(null);

  // Use controlled or uncontrolled mode
  const activeSlice = controlledActiveSlice !== undefined ? controlledActiveSlice : internalActiveSlice;
  const setActiveSlice = onActiveSliceChange || setInternalActiveSlice;

  const viewBox = 900;
  const cx = viewBox / 2;
  const cy = viewBox / 2;

  // Radii
  const outerRadius = 430;      // Outer edge of segments (large)
  const petalMaxRadius = 420;   // Max reach of colored petals (almost full slice)
  const labelRadius = 280;      // Where labels sit (inside, can overlap petals)
  const centerRadius = 35;      // Center circle
  const gap = 5;                // Gap between segments
  const cornerRadius = 14;      // Rounded corners for petals

  // Pale version of colors for backgrounds
  const getPaleColor = (color: string) => {
    // Return a very pale version of the color
    return color + '20'; // 20 = ~12% opacity in hex
  };

  // Result lookup
  const resultMap = new Map(results.map((r) => [r.categoryId, r.visibilityLevel]));

  // Handle slice click
  const handleSliceClick = (categoryId: string) => {
    if (!editable) return;
    setActiveSlice(activeSlice === categoryId ? null : categoryId);
  };

  // Handle increment/decrement
  const handleAdjustLevel = (categoryId: string, delta: number) => {
    if (!onResultsChange) return;

    const newResults = results.map((r) => {
      if (r.categoryId === categoryId) {
        const newLevel = Math.max(0, Math.min(10, r.visibilityLevel + delta)) as VisibilityLevel;
        return { ...r, visibilityLevel: newLevel };
      }
      return r;
    });
    onResultsChange(newResults);
  };

  // Polar to Cartesian
  const toXY = (angleDeg: number, r: number) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // Create wedge path with optional rounded corners on all 4 corners
  const wedgePath = (startAngle: number, endAngle: number, innerR: number, outerR: number, rounded = false) => {
    const gapAngle = gap / outerR * (180 / Math.PI); // Convert gap to angle
    const adjStart = startAngle + gapAngle / 2;
    const adjEnd = endAngle - gapAngle / 2;

    const outer1 = toXY(adjStart, outerR);
    const outer2 = toXY(adjEnd, outerR);
    const inner1 = toXY(adjStart, innerR);
    const inner2 = toXY(adjEnd, innerR);

    if (rounded) {
      // Calculate corner offset points for rounded corners
      const cr = cornerRadius;
      const startRad = (adjStart - 90) * (Math.PI / 180);
      const endRad = (adjEnd - 90) * (Math.PI / 180);

      // Points slightly inset from corners for rounding
      const outer1Inner = toXY(adjStart, outerR - cr);
      const outer1Along = toXY(adjStart + cr * (180 / Math.PI) / outerR, outerR);
      const outer2Along = toXY(adjEnd - cr * (180 / Math.PI) / outerR, outerR);
      const outer2Inner = toXY(adjEnd, outerR - cr);
      const inner2Outer = toXY(adjEnd, innerR + cr);
      const inner2Along = toXY(adjEnd - cr * (180 / Math.PI) / innerR, innerR);
      const inner1Along = toXY(adjStart + cr * (180 / Math.PI) / innerR, innerR);
      const inner1Outer = toXY(adjStart, innerR + cr);

      return `
        M ${inner1Outer.x} ${inner1Outer.y}
        Q ${inner1.x} ${inner1.y} ${inner1Along.x} ${inner1Along.y}
        A ${innerR} ${innerR} 0 0 0 ${inner2Along.x} ${inner2Along.y}
        Q ${inner2.x} ${inner2.y} ${inner2Outer.x} ${inner2Outer.y}
        L ${outer2Inner.x} ${outer2Inner.y}
        Q ${outer2.x} ${outer2.y} ${outer2Along.x} ${outer2Along.y}
        A ${outerR} ${outerR} 0 0 0 ${outer1Along.x} ${outer1Along.y}
        Q ${outer1.x} ${outer1.y} ${outer1Inner.x} ${outer1Inner.y}
        Z
      `;
    }

    return `
      M ${inner1.x} ${inner1.y}
      L ${outer1.x} ${outer1.y}
      A ${outerR} ${outerR} 0 0 1 ${outer2.x} ${outer2.y}
      L ${inner2.x} ${inner2.y}
      A ${innerR} ${innerR} 0 0 0 ${inner1.x} ${inner1.y}
      Z
    `;
  };

  // Label position - horizontal text with per-segment angle adjustment
  const labelPos = (index: number) => {
    const baseAngle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;

    // Per-segment tuning: anchor, angleOffset, and optional radius adjustment
    // Segments go clockwise from top: 0=18°, 1=54°, 2=90°, 3=126°, 4=162°, 5=198°, 6=234°, 7=270°, 8=306°, 9=342°
    const segmentConfig: Record<number, { anchor: 'start' | 'middle' | 'end'; offset: number; radiusOffset?: number }> = {
      0: { anchor: 'start', offset: -8 },   // Skin Radiance (18°) - push more towards top, away from Skin Aging
      1: { anchor: 'start', offset: 2 },    // Skin Aging (54°) - push towards Visible Redness, away from Skin Radiance
      2: { anchor: 'start', offset: 0, radiusOffset: -60 },    // Visible Redness (90°) - bring more inside, away from + button
      3: { anchor: 'start', offset: 4, radiusOffset: 15 },    // Hydration Appearance (126°) - push out more
      4: { anchor: 'middle', offset: 0, radiusOffset: 25 },   // Shine Appearance (162°) - center and push out, away from Skin Texture
      5: { anchor: 'end', offset: -12 },     // Skin Texture (198°) - push towards Shine Appearance
      6: { anchor: 'end', offset: -10 },    // Visible Blemishes (234°) - left
      7: { anchor: 'end', offset: -2, radiusOffset: -80 },     // Uneven Tone (270°) - bring more inside
      8: { anchor: 'end', offset: 0 },      // Eye Contour (306°) - push towards top
      9: { anchor: 'middle', offset: 0 },   // Neck & Décolleté (342°) - top center
    };

    const config = segmentConfig[index] || { anchor: 'middle', offset: 0 };
    const adjustedAngle = baseAngle + config.offset;
    const adjustedRadius = labelRadius + (config.radiusOffset || 0);
    const pos = toXY(adjustedAngle, adjustedRadius);

    return { ...pos, anchor: config.anchor };
  };

  // Get visibility label and color based on dysfunction score (0-10)
  const getVisibilityStyle = (level: VisibilityLevel): { label: string; color: string } => {
    if (level === 0) {
      return { label: 'Optimal', color: '#10B981' };           // Green - best
    } else if (level < 4) {
      return { label: 'Needs Improvement', color: '#34D399' }; // Light green
    } else if (level < 7) {
      return { label: 'Attention Needed', color: '#FBBF24' };  // Yellow/amber
    } else {
      return { label: 'Focus Area', color: '#EF4444' };        // Red - most concern
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      style={{ overflow: 'visible' }}
      onClick={() => editable && setActiveSlice(null)}
    >
      {/* Invisible background to catch clicks outside pie */}
      <rect
        x="0"
        y="0"
        width={viewBox}
        height={viewBox}
        fill="transparent"
      />
      <defs>
        {/* Subtle shadow for depth */}
        <filter id="petalShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Background wedges (pale version of each category color) */}
      {SKIN_WELLNESS_CATEGORIES.map((category, index) => {
        const startAngle = index * SEGMENT_ANGLE;
        const endAngle = startAngle + SEGMENT_ANGLE;
        const isActive = activeSlice === category.id;

        return (
          <path
            key={`bg-${category.id}`}
            d={wedgePath(startAngle, endAngle, centerRadius + 2, outerRadius, true)}
            fill={isActive ? category.color + '25' : category.color + '12'}
            stroke={isActive ? category.color + '50' : category.color + '20'}
            strokeWidth={isActive ? 2 : 1}
            onClick={(e) => { e.stopPropagation(); handleSliceClick(category.id); }}
            style={{ cursor: editable ? 'pointer' : 'default' }}
          />
        );
      })}

      {/* Colored wedge petals (variable length based on visibility) */}
      {SKIN_WELLNESS_CATEGORIES.map((category, index) => {
        const startAngle = index * SEGMENT_ANGLE;
        const endAngle = startAngle + SEGMENT_ANGLE;
        const level = resultMap.get(category.id) ?? 5;
        const lengthRatio = getVisibilityLength(level);
        const petalOuterRadius = centerRadius + (petalMaxRadius - centerRadius) * lengthRatio;
        const isActive = activeSlice === category.id;

        return (
          <path
            key={`petal-${category.id}`}
            d={wedgePath(startAngle, endAngle, centerRadius + 2, petalOuterRadius, true)}
            fill={category.color}
            stroke={isActive ? 'white' : 'none'}
            strokeWidth={isActive ? 2 : 0}
            onClick={(e) => { e.stopPropagation(); handleSliceClick(category.id); }}
            className="petal-transition petal-hover"
            style={{
              cursor: editable ? 'pointer' : 'default',
            }}
          />
        );
      })}

      {/* Center white circle */}
      <circle cx={cx} cy={cy} r={centerRadius} fill="white" />

      {/* Labels - horizontal with scale value and background pill */}
      {SKIN_WELLNESS_CATEGORIES.map((category, index) => {
        const { x, y, anchor } = labelPos(index);
        const level = resultMap.get(category.id) ?? 5;
        const { label: scaleLabel, color: scaleColor } = getVisibilityStyle(level);
        const scoreText = `${scaleLabel} ${level}/10`;

        // Calculate pill width based on text length (longer of category name or score text)
        // Tighter estimates: ~7px per char for 14px semibold, ~6.2px per char for 12px medium italic
        const categoryNameWidth = category.name.length * 7;
        const scoreTextWidth = scoreText.length * 6.2;
        const contentWidth = Math.max(categoryNameWidth, scoreTextWidth);
        const paddingX = 10; // Horizontal padding on each side
        const pillWidth = contentWidth + paddingX * 2;
        const pillHeight = 44;

        // Position pill so text is centered within it
        // Calculate where the pill center should be based on text anchor
        let pillCenterX;
        if (anchor === 'start') {
          // Text starts at x, center of content is at x + contentWidth/2
          pillCenterX = x + contentWidth / 2;
        } else if (anchor === 'end') {
          // Text ends at x, center of content is at x - contentWidth/2
          pillCenterX = x - contentWidth / 2;
        } else {
          // Text centered at x
          pillCenterX = x;
        }
        const pillX = pillCenterX - pillWidth / 2;

        return (
          <g
            key={`label-group-${category.id}`}
            onClick={(e) => { e.stopPropagation(); handleSliceClick(category.id); }}
            style={{ cursor: editable ? 'pointer' : 'default' }}
          >
            {/* Background pill */}
            <rect
              x={pillX}
              y={y - pillHeight / 2}
              width={pillWidth}
              height={pillHeight}
              rx="8"
              ry="8"
              fill="rgba(255, 255, 255, 0.93)"
              filter="url(#petalShadow)"
            />
            {/* Category name */}
            <text
              x={x}
              y={y - 7}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="#1F2937"
              fontSize="14"
              fontWeight="600"
              fontFamily="'Inter', system-ui, sans-serif"
            >
              {category.name}
            </text>
            {/* Scale value with score */}
            <text
              x={x}
              y={y + 10}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill={scaleColor}
              fontSize="12"
              fontWeight="500"
              fontFamily="'Inter', system-ui, sans-serif"
              fontStyle="italic"
            >
              {scoreText}
            </text>
          </g>
        );
      })}

      {/* Extended detail slice for active category */}
      {activeSlice && onLabelClick && SKIN_WELLNESS_CATEGORIES.map((category, index) => {
        if (category.id !== activeSlice) return null;

        const startAngle = index * SEGMENT_ANGLE;
        const endAngle = startAngle + SEGMENT_ANGLE;
        const midAngle = startAngle + SEGMENT_ANGLE / 2;
        const detailSliceInner = outerRadius + 10;
        const detailSliceOuter = outerRadius + 52;
        const labelPos = toXY(midAngle, (detailSliceInner + detailSliceOuter) / 2);

        // Create arc segment path with rounded corners
        const gapAngle = gap / detailSliceOuter * (180 / Math.PI);
        const adjStart = startAngle + gapAngle / 2;
        const adjEnd = endAngle - gapAngle / 2;
        const cr = 10; // Corner radius

        const outerStart = toXY(adjStart, detailSliceOuter);
        const outerEnd = toXY(adjEnd, detailSliceOuter);
        const innerStart = toXY(adjStart, detailSliceInner);
        const innerEnd = toXY(adjEnd, detailSliceInner);

        // Corner offset points for rounding
        const outerStartInner = toXY(adjStart, detailSliceOuter - cr);
        const outerStartAlong = toXY(adjStart + cr * (180 / Math.PI) / detailSliceOuter, detailSliceOuter);
        const outerEndAlong = toXY(adjEnd - cr * (180 / Math.PI) / detailSliceOuter, detailSliceOuter);
        const outerEndInner = toXY(adjEnd, detailSliceOuter - cr);
        const innerEndOuter = toXY(adjEnd, detailSliceInner + cr);
        const innerEndAlong = toXY(adjEnd - cr * (180 / Math.PI) / detailSliceInner, detailSliceInner);
        const innerStartAlong = toXY(adjStart + cr * (180 / Math.PI) / detailSliceInner, detailSliceInner);
        const innerStartOuter = toXY(adjStart, detailSliceInner + cr);

        const arcPath = `
          M ${innerStartOuter.x} ${innerStartOuter.y}
          Q ${innerStart.x} ${innerStart.y} ${innerStartAlong.x} ${innerStartAlong.y}
          A ${detailSliceInner} ${detailSliceInner} 0 0 1 ${innerEndAlong.x} ${innerEndAlong.y}
          Q ${innerEnd.x} ${innerEnd.y} ${innerEndOuter.x} ${innerEndOuter.y}
          L ${outerEndInner.x} ${outerEndInner.y}
          Q ${outerEnd.x} ${outerEnd.y} ${outerEndAlong.x} ${outerEndAlong.y}
          A ${detailSliceOuter} ${detailSliceOuter} 0 0 0 ${outerStartAlong.x} ${outerStartAlong.y}
          Q ${outerStart.x} ${outerStart.y} ${outerStartInner.x} ${outerStartInner.y}
          Z
        `;

        // Create curved text path (arc at the middle of the wedge)
        const textRadius = (detailSliceInner + detailSliceOuter) / 2 - 4;
        const textPathId = `detail-text-path-${category.id}`;
        const textStart = toXY(adjStart, textRadius);
        const textEnd = toXY(adjEnd, textRadius);

        const textArcPath = `
          M ${textStart.x} ${textStart.y}
          A ${textRadius} ${textRadius} 0 0 1 ${textEnd.x} ${textEnd.y}
        `;

        return (
          <g
            key={`detail-slice-${category.id}`}
            onClick={(e) => { e.stopPropagation(); onLabelClick(category.id); }}
            style={{ cursor: 'pointer' }}
            className="detail-slice-hover"
          >
            {/* Drop shadow for button-like effect */}
            <path
              d={arcPath}
              fill="rgba(0,0,0,0.1)"
              transform="translate(2, 2)"
            />
            <path
              d={arcPath}
              fill="white"
              stroke={category.color}
              strokeWidth="2"
            />
            {/* Curved text path */}
            <defs>
              <path id={textPathId} d={textArcPath} fill="none" />
            </defs>
            <text
              fill={category.color}
              fontSize="14"
              fontWeight="600"
              fontFamily="'Inter', system-ui, sans-serif"
              dominantBaseline="middle"
            >
              <textPath
                href={`#${textPathId}`}
                startOffset="50%"
                textAnchor="middle"
              >
                ⓘ View Details
              </textPath>
            </text>
          </g>
        );
      })}

      {/* +/- Control buttons for active slice */}
      {editable && activeSlice && SKIN_WELLNESS_CATEGORIES.map((category, index) => {
        if (category.id !== activeSlice) return null;

        const midAngle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
        const level = resultMap.get(category.id) ?? 5;

        // + button position (outer edge of slice)
        const plusPos = toXY(midAngle, outerRadius - 28);
        // - button position (fixed near center, just outside the center circle)
        const minusPos = toXY(midAngle, centerRadius + 30);

        const plusButtonRadius = 22;
        const minusButtonRadius = 17;
        const canIncrease = level < 10;
        const canDecrease = level > 0;

        return (
          <g key={`controls-${category.id}`}>
            {/* + Button (increase) - always render, disabled at max */}
            <g
              onClick={(e) => { e.stopPropagation(); if (canIncrease) handleAdjustLevel(category.id, 1); }}
              style={{ cursor: canIncrease ? 'pointer' : 'not-allowed', userSelect: 'none' }}
              opacity={canIncrease ? 1 : 0.3}
            >
              <circle
                cx={plusPos.x}
                cy={plusPos.y}
                r={plusButtonRadius}
                fill={category.color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={plusPos.x}
                y={plusPos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="28"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                +
              </text>
            </g>

            {/* - Button (decrease) - always render, disabled at min */}
            <g
              onClick={(e) => { e.stopPropagation(); if (canDecrease) handleAdjustLevel(category.id, -1); }}
              style={{ cursor: canDecrease ? 'pointer' : 'not-allowed', userSelect: 'none' }}
              opacity={canDecrease ? 1 : 0.3}
            >
              <circle
                cx={minusPos.x}
                cy={minusPos.y}
                r={minusButtonRadius}
                fill={category.color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={minusPos.x}
                y={minusPos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="22"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                −
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export function FlowerLegend() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {SKIN_WELLNESS_CATEGORIES.map((category) => (
        <div key={category.id} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm text-stone-600">{category.name}</span>
        </div>
      ))}
    </div>
  );
}
