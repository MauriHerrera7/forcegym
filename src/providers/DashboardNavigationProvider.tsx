'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

type View = 'dashboard' | 'users' | 'payments' | 'renewals' | 'profile' | 'support' | 'training' | 'routines' | 'memberships';

interface DashboardNavigationContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const DashboardNavigationContext = createContext<DashboardNavigationContextType | undefined>(undefined);

export function DashboardNavigationProvider({ 
  children,
  initialView = 'dashboard'
}: { 
  children: React.ReactNode;
  initialView?: View;
}) {
  const searchParams = useSearchParams();
  
  // Initialize state with 'dashboard' (SSR safe) or provided initialView
  const [currentView, setView] = useState<View>(initialView);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync to cookies whenever view changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      Cookies.set('forcegym_dashboard_view', currentView, { expires: 7, path: '/' });
    }
  }, [currentView, isInitialized]);

  // Load from localStorage on mount as backup or if prop was default
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const queryView = searchParams.get('v') as View;
      const savedView = Cookies.get('forcegym_dashboard_view') as View;
      
      // Basic validation list
      const validViews: View[] = ['dashboard', 'users', 'payments', 'renewals', 'profile', 'support', 'training', 'routines', 'memberships'];
      
      // Determine initial view: Query Param has highest priority
      const restoredView = (queryView && validViews.includes(queryView)) 
        ? queryView 
        : (savedView && validViews.includes(savedView))
          ? savedView
          : null;
      
      if (restoredView && restoredView !== currentView) {
        setView(restoredView);
      }
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized, currentView]);

  const setCurrentView = (view: View) => {
    setView(view);
    window.scrollTo(0, 0);
  };

  return (
    <DashboardNavigationContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

export function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);
  if (context === undefined) {
    throw new Error('useDashboardNavigation must be used within a DashboardNavigationProvider');
  }
  return context;
}

/** Safe version that returns null when outside the provider (no throw) */
export function useDashboardNavigationSafe() {
  return useContext(DashboardNavigationContext) ?? null;
}
