'use client'

import React from 'react'
import { useAppNavigation } from '@/providers/AppNavigationProvider'

// Landing Components
import AppleHero from '@/components/landing/AppleHero'
import SpaceExperience from '@/components/landing/SpaceExperience'
import TechComplement from '@/components/landing/TechComplement'
import ApplePricing from '@/components/landing/ApplePricing'
import AppleTestimonials from '@/components/landing/Testimonials'
import ActionCTA from '@/components/landing/ActionCTA'
import AppleFooter from '@/components/landing/AppleFooter'
import TrainingTech from '@/components/landing/TrainingTech'

// Auth Pages (Components)
import RegisterPage from './auth/register/page'
import LoginPage from './auth/login/page'

// Dashboard Pages & Layouts
import AdminDashboard from './(dashboard)/admin/page'
import AdminLayout from './(dashboard)/admin/layout'
import ClientDashboard from './(dashboard)/client/page'
import ClientLayout from './(dashboard)/client/layout'

const LandingPage: React.FC = () => {
  const { currentView, initialDashboardView } = useAppNavigation();

  if (currentView === 'register') return <RegisterPage />;
  if (currentView === 'login') return <LoginPage />;
  
  if (currentView === 'admin') {
    return (
      <AdminLayout initialView={initialDashboardView as any}>
        <AdminDashboard />
      </AdminLayout>
    );
  }

  if (currentView === 'client') {
    return (
      <ClientLayout initialView={initialDashboardView as any}>
        <ClientDashboard />
      </ClientLayout>
    );
  }

  return (
    <main className="bg-apple-black text-white selection:bg-apple-red selection:text-white flex flex-col min-h-screen">
      <AppleHero />
      <SpaceExperience />
      <TrainingTech />
      <TechComplement />
      <ApplePricing />
      <AppleTestimonials />
      <ActionCTA />
      <AppleFooter />

      <style jsx global>{`
        body { background-color: #0B0B0B; }
        .fade-up { animation: fade-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0B0B0B; }
        ::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #E10600; }
      `}</style>
    </main>
  )
}

export default LandingPage
