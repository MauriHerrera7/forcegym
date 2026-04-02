'use client';

import React, { useState } from 'react';
import Container from '@/components/Container';
import { MuscleSelector } from '@/components/training/MuscleSelector';
import { Dumbbell, Plus, Zap, Target, Flame, ArrowRight } from 'lucide-react';
import { useAppNavigation } from '@/providers/AppNavigationProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

const TrainingTech: React.FC = () => {
  const { navigateTo } = useAppNavigation();
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const handleExploreClick = () => {
    if (isAuthenticated) {
      router.push('/client/training');
    } else {
      localStorage.setItem('forcegym_auth_redirect', '/client/training');
      navigateTo('register');
    }
  };

  const mockExercises = [
    { name: 'Press de Banca', sets: 4, reps: 10, intensity: 'Alta' },
    { name: 'Sentadillas', sets: 3, reps: 12, intensity: 'Media' },
    { name: 'Peso Muerto', sets: 5, reps: 5, intensity: 'Máxima' },
  ];

  return (
    <section className="bg-apple-black py-32 md:py-48 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-apple-red/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-zinc-800/20 blur-[150px] rounded-full" />
      </div>

      <Container>
        {/* Section Header */}
        <div className="text-center mb-24 space-y-6 fade-up">
          <span className="text-apple-red font-black uppercase tracking-[0.5em] text-xs">TECNOLOGÍA DE ENTRENAMIENTO</span>
          <h2 className="text-white font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl italic uppercase tracking-tighter leading-none">
            TU CUERPO.<br />
            <span className="text-red-600 outline-text-red">BAJO CONTROL.</span>
          </h2>
          <p className="text-zinc-500 font-bold text-lg md:text-xl max-w-2xl mx-auto italic">
            Elige qué músculo quieres trabajar y te enseñamos exactamente cómo entrenarlo con inteligencia artificial.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Feature 1: Muscle Selector */}
          <div className="space-y-12 order-2 lg:order-1 cursor-pointer" onClick={handleExploreClick}>
            <div className="space-y-6 fade-up">
              <div className="inline-flex items-center gap-3 bg-apple-red/10 border border-apple-red/20 px-4 py-2 rounded-2xl">
                <Target className="w-5 h-5 text-apple-red" />
                <span className="text-apple-red font-black uppercase tracking-widest text-[10px]">Anatomía Interactiva</span>
              </div>
              <h3 className="text-white font-black text-4xl md:text-5xl uppercase italic tracking-tighter">
                Elegí un <span className="text-apple-red">Músculo</span>. <br />
                Te enseñamos cómo <span className="text-apple-red">Entrenarlo</span>.
              </h3>
              <p className="text-zinc-400 font-medium text-lg leading-relaxed italic border-l-2 border-zinc-800 pl-6">
                Selecciona cualquier zona de tu cuerpo. Nuestra plataforma te proporcionará los ejercicios óptimos, la técnica perfecta y la rutina ideal para maximizar tus resultados.
              </p>

              {/* Stats/Badge */}
              <div className="flex gap-4 pt-4">
                 <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex-1">
                    <span className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Precisión</span>
                    <span className="text-white font-black text-2xl italic">100%</span>
                 </div>
                 <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex-1">
                    <span className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Músculos</span>
                    <span className="text-white font-black text-2xl italic">70+</span>
                 </div>
              </div>
            </div>
            
            <div className="lg:hidden fade-up">
                {/* Mobile Preview would go here, maybe just skip or show simplified */}
            </div>
          </div>

          {/* Muscle Selector Visual Only Component */}
          <div className="order-1 lg:order-2 relative group fade-up delay-200 cursor-pointer" onClick={handleExploreClick}>
            <div className="absolute inset-0 bg-apple-red/5 blur-[100px] group-hover:bg-apple-red/10 transition-all duration-700" />
            <div className="relative z-10 bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm overflow-hidden min-h-[600px] flex items-center justify-center">
               <div className="scale-90 md:scale-100 transition-transform duration-700 group-hover:scale-[1.02] pointer-events-none select-none opacity-80 group-hover:opacity-100">
                 <MuscleSelector 
                    onMuscleClick={() => {}}
                    onHoverChange={() => {}}
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent my-32" />

        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Routine Builder Visual Mockup */}
          <div className="relative group fade-up cursor-pointer" onClick={handleExploreClick}>
            <div className="absolute inset-0 bg-zinc-800/10 blur-[100px] group-hover:bg-zinc-800/20 transition-all duration-700" />
            <div className="relative z-10 space-y-4">
              {mockExercises.map((ex, i) => (
                <div 
                  key={i} 
                  className={`
                    bg-[#0D0D0D] border border-white/5 p-6 rounded-3xl flex items-center justify-between 
                    transition-all duration-500 hover:translate-x-4 hover:border-apple-red/30
                    ${i === 1 ? 'ml-8' : i === 2 ? 'ml-16' : ''}
                  `}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-apple-red/10 rounded-2xl flex items-center justify-center">
                       <Dumbbell className="w-6 h-6 text-apple-red" />
                    </div>
                    <div>
                      <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">{ex.name}</h4>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{ex.intensity} INTENSIDAD</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="text-center">
                      <span className="block text-[8px] text-zinc-600 font-bold uppercase">Series</span>
                      <span className="text-white font-black text-lg italic">{ex.sets}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[8px] text-zinc-600 font-bold uppercase">Reps</span>
                      <span className="text-white font-black text-lg italic">{ex.reps}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-apple-red/50 transition-colors">
                       <Plus className="w-4 h-4 text-zinc-600 group-hover:text-apple-red" />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="absolute -bottom-8 right-0 -z-10 group-hover:scale-110 transition-transform duration-700 opacity-50 blur-2xl bg-apple-red w-32 h-32 rounded-full" />
            </div>
          </div>

          {/* Routine Builder Copy */}
          <div className="space-y-12">
            <div className="space-y-6 fade-up">
              <div className="inline-flex items-center gap-3 bg-zinc-800/30 border border-zinc-700/30 px-4 py-2 rounded-2xl">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="text-white font-black uppercase tracking-widest text-[10px]">Arquitectura de Entrenamiento</span>
              </div>
              <h3 className="text-white font-black text-4xl md:text-5xl uppercase italic tracking-tighter">
                Diseñador de <span className="text-zinc-600">Rutinas.</span>
              </h3>
              <p className="text-zinc-400 font-medium text-lg leading-relaxed italic border-l-2 border-zinc-800 pl-6">
                Personaliza cada entrenamiento según tus objetivos. Una vez configurada, puedes imprimir tu rutina para llevarla contigo al gimnasio y seguir tu progreso sin distracciones.
              </p>

              <div className="space-y-4">
                 {[
                   { icon: <Flame className="w-4 h-4" />, text: "Personalización total de ejercicios" },
                   { icon: <Zap className="w-4 h-4" />, text: "Impresión instantánea de rutinas" },
                   { icon: <Target className="w-4 h-4" />, text: "Diseños optimizados para el club" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 text-zinc-300">
                      <div className="text-apple-red">{item.icon}</div>
                      <span className="text-sm font-bold italic uppercase tracking-tighter">{item.text}</span>
                   </div>
                 ))}
              </div>

              <button 
                onClick={handleExploreClick}
                className="group/train_btn relative px-8 py-5 rounded-2xl font-black uppercase italic tracking-widest transition-all duration-500 bg-white hover:scale-105 active:scale-95 shadow-xl hover:shadow-[0_20px_50px_rgba(255,4,0,0.4)] overflow-hidden"
              >
                {/* Background transition */}
                <div 
                  className="absolute inset-0 bg-[#ff0400] translate-y-full group-hover/train_btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                />
                
                {/* Unified Text Layer */}
                <span className="relative z-20 flex items-center justify-center gap-4 text-black group-hover/train_btn:text-red transition-colors duration-300">
                  Empezar ahora 
                  <ArrowRight className="w-5 h-5 group-hover/train_btn:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px #27272a;
          color: transparent;
        }
        @media (min-width: 1024px) {
          .outline-text {
            -webkit-text-stroke: 2px #27272a;
          }
        }
      `}</style>
    </section>
  );
};

export default TrainingTech;
