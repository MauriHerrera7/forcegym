import React from 'react'
import Container from '@/components/Container'
import Link from 'next/link'
import { useAuthContext } from '@/providers/AuthProvider'
import { useAppNavigation } from '@/providers/AppNavigationProvider'

const ActionCTA: React.FC = () => {
  const { user } = useAuthContext();
  const { navigateTo } = useAppNavigation();

  const handleAction = () => {
    if (user) {
      const dashboardView = user.role?.toUpperCase() === 'ADMIN' ? 'admin' : 'client';
      navigateTo(dashboardView);
    } else {
      navigateTo('register');
    }
  };

  return (
    <section className="bg-apple-black py-32 sm:py-48 md:py-64 overflow-hidden relative">
      {/* Dynamic Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-full bg-apple-red/5 -skew-y-6 z-0" />
      
      <Container className="relative z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-16 fade-up">
           <h2 className="text-white font-black text-6xl sm:text-8xl md:text-[12rem] lg:text-[15rem] italic uppercase tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl">
             TU FUTURO <br /> <span className="text-apple-red">ES HOY.</span>
           </h2>
           
           <div className="flex flex-col items-center gap-12">
              <p className="text-zinc-400 font-bold text-xl md:text-2xl italic uppercase tracking-widest max-w-2xl leading-relaxed">
                  La evolución no espera. Únete al club de entrenamiento más avanzado y redefine tus propios límites.
              </p>
              
              <button 
                onClick={handleAction}
                className="group relative bg-white text-black px-10 py-6 sm:px-20 sm:py-8 text-xl sm:text-3xl font-black italic uppercase tracking-tighter transition-all duration-500 hover:bg-[#DC143C] hover:text-white active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">{user ? 'IR AL DASHBOARD' : 'UNIRSE A LA ÉLITE'}</span>
                <div className="absolute inset-0 bg-[#DC143C] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                  {user ? 'IR AL DASHBOARD' : 'UNIRSE A LA ÉLITE'}
                </span>
              </button>
           </div>
        </div>
      </Container>
    </section>
  );
};

export default ActionCTA
