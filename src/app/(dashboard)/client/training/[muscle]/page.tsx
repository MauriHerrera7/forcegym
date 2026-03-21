'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { muscleData } from '@/lib/muscleData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, X, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MuscleDetailPageProps {
  params: Promise<{
    muscle: string;
  }>;
}

export default function MuscleDetailPage({ params }: MuscleDetailPageProps) {
  const { muscle } = use(params);
  const muscleInfo = muscleData[muscle as keyof typeof muscleData];

  if (!muscleInfo) {
    notFound();
  }

  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const activeExercise = muscleInfo.exercises[activeExerciseIdx];

  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}?rel=0`
      : null;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return difficulty;
    }
  };

  return (
    <div className="w-full max-w-full lg:max-w-[1600px] mx-auto space-y-4 -mt-2 md:-mt-6 overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-white/5 pb-4 px-4 md:px-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/client/training" className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-apple-red transition-colors font-bold">
              Entrenamiento
            </Link>
            <span className="text-zinc-700 text-xs">/</span>
            <span className="text-[10px] uppercase tracking-widest text-apple-red font-bold">{muscleInfo.name}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            {muscleInfo.name}
          </h1>
        </div>
        
        <Link href="/client/training">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white hover:bg-white/5 gap-2 uppercase tracking-tighter text-xs font-bold">
            <ArrowLeft className="h-3.5 w-3.5" />
            Cambiar Músculo
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start px-4 md:px-0">
        {/* LEFT/MAIN: THEATER STAGE */}
        <div className="lg:col-span-8 space-y-6 w-full min-w-0">
          {/* Main Video Player Area */}
          <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="aspect-video w-full bg-black relative">
              <iframe
                src={getEmbedUrl(activeExercise.videoUrl) || ''}
                title={activeExercise.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            {/* Exercise Basic Info Overlay */}
            <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight truncate">{activeExercise.name}</h2>
            </div>
          </div>

          <div className="lg:hidden w-full space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Explorar ejercicios</h3>
              <span className="text-xs text-apple-red font-black bg-apple-red/10 border border-apple-red/20 px-2.5 py-0.5 rounded-full">{muscleInfo.exercises.length}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
              {muscleInfo.exercises.map((exercise, idx) => (
                <button
                  key={exercise.id}
                  onClick={() => setActiveExerciseIdx(idx)}
                  className={cn(
                    "flex-shrink-0 w-[180px] text-left p-3 rounded-2xl border transition-all duration-300 snap-center",
                    activeExerciseIdx === idx 
                      ? "bg-apple-red/20 border-apple-red/40" 
                      : "bg-zinc-900/40 border-white/5"
                  )}
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative w-10 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={exercise.thumbnailUrl} alt={exercise.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-black uppercase truncate",
                        activeExerciseIdx === idx ? "text-white" : "text-zinc-500"
                      )}>{exercise.name}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions Card */}
          <Card className="bg-[#111111] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-apple-red/50 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base sm:text-lg uppercase tracking-[0.2em] font-black italic">
                Instrucciones Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg md:text-xl text-zinc-200 leading-relaxed font-medium">
                {activeExercise.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-start">
                  <div className="p-2 bg-apple-red/10 rounded-lg text-apple-red"><Play className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Ejecución</h4>
                    <p className="text-[11px] text-zinc-400">Controla el tempo en ambas fases del movimiento.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-start">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Dumbbell className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Carga</h4>
                    <p className="text-[11px] text-zinc-400">Prioriza la técnica. Aumenta el peso progresivamente.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: DESKTOP SIDEBAR */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Más ejercicios</h3>
              <Badge variant="outline" className="text-xs border-apple-red/30 text-apple-red font-black bg-apple-red/10">{muscleInfo.exercises.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {muscleInfo.exercises.map((exercise, idx) => (
                <button
                  key={exercise.id}
                  onClick={() => setActiveExerciseIdx(idx)}
                  className={cn(
                    "w-full text-left p-3 rounded-2xl border transition-all duration-300 flex items-center gap-4",
                    activeExerciseIdx === idx 
                      ? "bg-apple-red/10 border-apple-red/30" 
                      : "bg-[#151515] border-white/5 hover:bg-white/5"
                  )}
                >
                  <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={exercise.thumbnailUrl} alt={exercise.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-black uppercase truncate", activeExerciseIdx === idx ? "text-white" : "text-zinc-400")}>
                      {exercise.name}
                    </p>
                    <span className="text-[11px] text-zinc-500 uppercase font-black">{getDifficultyLabel(exercise.difficulty)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-zinc-900/40 border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-widest text-apple-red font-bold mb-2 font-black">Sobre {muscleInfo.name}</p>
              <p className="text-sm text-zinc-300 leading-relaxed italic">{muscleInfo.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
