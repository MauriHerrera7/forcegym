'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuthContext } from './AuthProvider';

export type AppView = 'landing' | 'login' | 'register' | 'admin' | 'client';

interface AppNavigationContextType {
  currentView: AppView;
  navigateTo: (view: AppView) => void;
  initialDashboardView?: string;
}

const AppNavigationContext = createContext<AppNavigationContextType | undefined>(undefined);

export function AppNavigationProvider({ 
  children,
  initialView = 'landing',
  initialDashboardView
}: { 
  children: React.ReactNode;
  initialView?: AppView;
  initialDashboardView?: string;
}) {
  const { isAuthenticated, user, loading } = useAuthContext();
  const [currentView, setCurrentView] = useState<AppView>(initialView);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync to cookies whenever view changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      Cookies.set('forcegym_app_view', currentView, { expires: 7, path: '/' });
    }
  }, [currentView, isInitialized]);

  // Load initial view from localStorage/Cookies only if prop was missing or as backup
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedView = Cookies.get('forcegym_app_view') as AppView;
      if (savedView && ['landing', 'login', 'register', 'admin', 'client'].includes(savedView)) {
        // If the prop was just 'landing' (default), maybe the cookie has something better
        if (initialView === 'landing' && savedView !== 'landing') {
          // Only set to protected views if we have a token or clue, to avoid flicker
          const hasToken = !!localStorage.getItem('access_token');
          if (hasToken || !['admin', 'client'].includes(savedView)) {
            setCurrentView(savedView);
          }
        }
      }
      setIsInitialized(true);
    }
  }, [initialView, isInitialized]);

  // Handle auth changes and persistence
  useEffect(() => {
    if (!loading && isInitialized) {
      if (isAuthenticated && user) {
        const roleView = user.role?.toUpperCase() === 'ADMIN' ? 'admin' : 'client';
        
        // If we just logged in or role changed, or if current view is not allowed for role
        if (currentView === 'login' || currentView === 'register') {
          setCurrentView(roleView);
        } else if (currentView === 'admin' && user.role?.toUpperCase() !== 'ADMIN') {
          setCurrentView('client');
        } else if (currentView === 'client' && user.role?.toUpperCase() === 'ADMIN') {
          setCurrentView('admin');
        }
      } else if (!isAuthenticated) {
        // Only reset to landing if we are currently in a protected view
        if (currentView === 'admin' || currentView === 'client') {
          setCurrentView('landing');
        }
      }
      
      // Sync to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('forcegym_app_view', currentView);
      }
    }
  }, [isAuthenticated, user, loading, currentView, isInitialized]);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const isProtectedView = currentView === 'admin' || currentView === 'client';

  return (
    <AppNavigationContext.Provider value={{ currentView, navigateTo, initialDashboardView }}>
      {/* 
        Si estamos cargando el usuario, mostramos un cargador 
        para evitar parpadeos de estados no autenticados.
      */}
      {loading ? (
        <div className="fixed inset-0 bg-[#0B0B0B] flex items-center justify-center z-[9999]">
          <div className="relative flex flex-col items-center gap-8">
            {/* Logo pulse/glow container */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 border-4 border-white/5 border-t-apple-red rounded-full animate-spin duration-700" />
              
              {/* Inner pulsing glow */}
              <div className="absolute inset-4 bg-apple-red/20 rounded-full blur-xl animate-pulse" />
              
              {/* Central Dumbbell Animation */}
              <div className="relative z-10 text-white animate-[lift_1.5s_infinite_ease-in-out]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6.5 6.5 11 11" />
                  <path d="m21 21-1-1" />
                  <path d="m3 3 1 1" />
                  <path d="m18 22 4-4" />
                  <path d="m2 6 4-4" />
                  <path d="m3 10 7-7" />
                  <path d="m14 21 7-7" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-white text-xl font-black tracking-[0.2em] uppercase italic animate-pulse">
                Force<span className="text-apple-red">Gym</span>
              </p>
              <div className="flex gap-1 h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-apple-red to-[#ff4d4d] animate-[loading-bar_2s_infinite_ease-in-out]" style={{ width: '40%' }} />
              </div>
            </div>
            
            <style jsx>{`
              @keyframes loading-bar {
                0% { transform: translateX(-100%); width: 20%; }
                50% { width: 50%; }
                100% { transform: translateX(400%); width: 20%; }
              }
              @keyframes lift {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(5deg); }
              }
            `}</style>
          </div>
        </div>
      ) : children}
    </AppNavigationContext.Provider>
  );
}

export function useAppNavigation() {
  const context = useContext(AppNavigationContext);
  if (context === undefined) {
    throw new Error('useAppNavigation must be used within an AppNavigationProvider');
  }
  return context;
}
