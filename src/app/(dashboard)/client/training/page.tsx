'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MuscleSelector } from '@/components/training/MuscleSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MUSCLE_GROUPS } from '@/lib/constants';

export default function TrainingPage() {
  const router = useRouter();
  const [selectedMuscleName, setSelectedMuscleName] = useState<string | null>(null);

  const handleMuscleClick = (muscleId: string) => {
    router.push(`/client/training/${muscleId}`);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto -mt-10">
      {/* Header Section simplified */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          Centro de <span className="text-apple-red">Entrenamiento</span>
        </h1>
        <div className="h-4 w-1 bg-apple-red/30 rounded-full" />
        <p className="text-[11px] text-zinc-400 uppercase tracking-[0.2em] hidden md:block font-bold">Interactive anatomy</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Instructions & Info (Sticky) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <Card className="bg-[#111111] border-[#252525] overflow-hidden group hover:border-apple-red/30 transition-all duration-500 shadow-2xl">
            <div className="p-1 bg-gradient-to-r from-apple-red/20 to-transparent w-full h-1" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-apple-red/10 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-apple-red" />
                </div>
                <CardTitle className="text-white text-xl font-bold tracking-tight">
                  Guía de Uso
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-4">
                {[
                  { step: '1', text: 'Selecciona entre vista frontal o posterior del modelo.' },
                  { step: '2', text: 'Pasa el cursor sobre los grupos musculares para resaltarlos.' },
                  { step: '3', text: 'Haz clic en un músculo para ver los ejercicios específicos.' },
                  { step: '4', text: 'Accede a videos e instrucciones detalladas en alta definición.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group/step">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-apple-red/10 border border-apple-red/20 flex items-center justify-center text-xs font-black text-apple-red group-hover/step:bg-apple-red group-hover/step:text-white transition-all">
                      {item.step}
                    </span>
                    <p className="text-sm text-zinc-400 group-hover/step:text-zinc-200 transition-colors leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pro Tip */}
              <div className="mt-8 p-4 rounded-xl bg-apple-red/5 border border-apple-red/10">
                <p className="text-[11px] uppercase tracking-[0.2em] text-apple-red font-black mb-1">PRO-TIP</p>
                <p className="text-[13px] text-zinc-300 italic leading-relaxed">
                  "La técnica correcta previene lesiones y maximiza el reclutamiento de fibras musculares."
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
        {/* Right Column: Interactive Selector */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="bg-[#111111] border-[#252525] border-dashed rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-apple-red/[0.02] to-transparent pointer-events-none" />
            <div className="relative p-2 md:p-4">
              <MuscleSelector 
                onMuscleClick={handleMuscleClick} 
                onHoverChange={setSelectedMuscleName}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
