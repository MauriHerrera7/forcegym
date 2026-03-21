'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SvgWrapper } from './anatomical/SvgWrapper';
import { bodyFront as maleFront } from './anatomical/bodyFrontData';
import { bodyBack as maleBack } from './anatomical/bodyBackData';
import { bodyFemaleFront } from './anatomical/bodyFemaleFrontData';
import { bodyFemaleBack } from './anatomical/bodyFemaleBackData';
import { BodyPart } from './anatomical/types';
import { useAuthContext } from '@/providers/AuthProvider';
import { MUSCLE_GROUPS } from '@/lib/constants';

interface MuscleSelectorProps {
  onMuscleClick: (muscleId: string) => void;
  onHoverChange?: (muscleName: string | null) => void;
}

export function MuscleSelector({ onMuscleClick, onHoverChange }: MuscleSelectorProps) {
  const { user } = useAuthContext();
  const initialGender = (user?.gender?.toLowerCase() === 'female') ? 'female' : 'male';
  
  const [activeGender, setActiveGender] = useState<'male' | 'female'>(initialGender);

  // Sync with auth user gender if it changes
  useEffect(() => {
    if (user?.gender) {
      setActiveGender(user.gender.toLowerCase() === 'female' ? 'female' : 'male');
    }
  }, [user?.gender]);

  const anatomicalData = useMemo(() => {
    return activeGender === 'female' 
      ? { front: bodyFemaleFront, back: bodyFemaleBack }
      : { front: maleFront, back: maleBack };
  }, [activeGender]);

  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const muscleMapping: Record<string, string> = {
    'pecho': 'pecho',
    'abdominales': 'abs',
    'oblicuos': 'abs',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'antebrazos': 'antebrazos',
    'cuadriceps': 'cuadriceps',
    'aductores': 'cuadriceps',
    'pantorrillas': 'pantorrillas',
    'isquiotibiales': 'isquiotibiales',
    'gluteos': 'gluteos',
    'espalda-superior': 'espalda',
    'espalda-inferior': 'espalda',
    'deltoides': 'hombros',
    'trapecio': 'espalda',
    'cuello': 'hombros',
  };

  const getMuscleName = useCallback((slug: string) => {
    const targetId = muscleMapping[slug] || slug;
    const group = MUSCLE_GROUPS.find((g) => g.id === targetId);
    return group ? group.name : slug;
  }, [muscleMapping]);

  // Notify parent of hover change
  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(hoveredMuscle ? getMuscleName(hoveredMuscle) : null);
    }
  }, [hoveredMuscle, onHoverChange, getMuscleName]);

  const handleMuscleClick = (muscle: BodyPart) => {
    const targetId = muscleMapping[muscle.slug] || muscle.slug;
    setSelectedMuscle(muscle.slug);
    onMuscleClick(targetId);
  };

  const NON_INTERACTIVE = new Set(['cabeza', 'pelo', 'cuello', 'mano', 'pie', 'tibial', 'tibialis', 'tobillo', 'rodillas', 'antebrazos', 'pantorrillas', 'calves']);

  const renderPaths = (
    paths: string[],
    slug: string,
    sideLabel?: string,
    muscles?: BodyPart[],
    muscleColor?: string
  ) => {
    const isNonInteractive = NON_INTERACTIVE.has(slug);
    const isSelected = !isNonInteractive && selectedMuscle === slug;
    const isHovered = !isNonInteractive && hoveredMuscle === slug;
    const isHead = slug === 'head' || slug === 'hair';
    const isActive = isSelected || isHovered;
    const defaultMuscleColor = muscleColor || '#6b7280';

    return paths.map((d, i) => (
      <path
        key={`${slug}-${sideLabel}-${i}`}
        d={d}
        fill={isSelected ? '#ff0400' : isHovered ? '#ff6b68' : defaultMuscleColor}
        fillOpacity={isActive ? 0.9 : isHead ? 0.35 : 0.5}
        stroke={isSelected ? '#ff0400' : isHovered ? '#ff6b68' : defaultMuscleColor}
        strokeWidth="1"
        strokeOpacity={isActive ? 0.9 : isHead ? 0.7 : 0.4}
        className={isNonInteractive ? 'cursor-default' : 'cursor-pointer transition-all duration-150'}
        onMouseEnter={() => !isNonInteractive && setHoveredMuscle(slug)}
        onMouseLeave={() => setHoveredMuscle(null)}
        onClick={() => {
          const found = muscles?.find((m) => m.slug === slug);
          if (found && !isNonInteractive) handleMuscleClick(found);
        }}
      />
    ));
  };

  const renderMuscles = (muscles: BodyPart[]) =>
    muscles.map((muscle) => (
      <g key={muscle.slug}>
        {muscle.path.common && renderPaths(muscle.path.common, muscle.slug, undefined, muscles, muscle.color)}
        {muscle.path.left && renderPaths(muscle.path.left, muscle.slug, 'left', muscles, muscle.color)}
        {muscle.path.right && renderPaths(muscle.path.right, muscle.slug, 'right', muscles, muscle.color)}
      </g>
    ));

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Side-by-side models */}
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center md:items-stretch">
        {/* Anterior */}
        <div className="flex flex-col items-center gap-2 w-full max-w-[320px]">
          <span className="text-[11px] uppercase tracking-[0.4em] text-zinc-400 font-black">
            Anterior
          </span>
          <div className="bg-[#0D0D0D] rounded-3xl border border-white/5 p-4 flex items-center justify-center w-full aspect-[320/640]">
            <SvgWrapper side="front" gender={activeGender}>
              {renderMuscles(anatomicalData.front)}
            </SvgWrapper>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/5 self-stretch my-2" />

        {/* Posterior */}
        <div className="flex flex-col items-center gap-2 w-full max-w-[320px]">
          <span className="text-[11px] uppercase tracking-[0.4em] text-zinc-400 font-black">
            Posterior
          </span>
          <div className="bg-[#0D0D0D] rounded-3xl border border-white/5 p-4 flex items-center justify-center w-full aspect-[320/640]">
            <SvgWrapper side="back" gender={activeGender}>
              {renderMuscles(anatomicalData.back)}
            </SvgWrapper>
          </div>
        </div>
      </div>

      <p className="text-zinc-500 text-[11px] uppercase tracking-[0.3em] font-black mt-2">
        Explora la anatomía interactiva
      </p>

      {/* Mouse-following tooltip — fixed to viewport, follows cursor */}
      {hoveredMuscle && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: mousePos.x + 18,
            top: mousePos.y - 14,
          }}
        >
          {/* Left arrow */}
          <div className="absolute top-[14px] -left-[6px] w-3 h-3 rotate-45 bg-[#1a1a1a] border-l border-b border-apple-red/50" />
          {/* Box */}
          <div className="bg-[#1a1a1a] border border-apple-red/50 rounded-xl px-4 py-2.5 shadow-[0_0_24px_rgba(255,4,0,0.2)] min-w-[148px]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-apple-red/70 mb-0.5 font-black">
              Grupo muscular
            </p>
            <p className="text-white font-black uppercase tracking-[0.1em] text-sm leading-tight">
              {getMuscleName(hoveredMuscle)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
