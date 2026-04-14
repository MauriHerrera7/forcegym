'use client';

import React, { createContext, useContext, useState } from 'react';
import PlanModal from '@/components/PlanModal';

interface PlanModalContextType {
  openPlanModal: () => void;
  closePlanModal: () => void;
  isOpen: boolean;
}

const PlanModalContext = createContext<PlanModalContextType | undefined>(undefined);

export function PlanModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPlanModal = () => setIsOpen(true);
  const closePlanModal = () => setIsOpen(false);

  return (
    <PlanModalContext.Provider value={{ openPlanModal, closePlanModal, isOpen }}>
      {children}
      <PlanModal isOpen={isOpen} onClose={closePlanModal} />
    </PlanModalContext.Provider>
  );
}

export function usePlanModal() {
  const context = useContext(PlanModalContext);
  if (context === undefined) {
    throw new Error('usePlanModal must be used within a PlanModalProvider');
  }
  return context;
}
