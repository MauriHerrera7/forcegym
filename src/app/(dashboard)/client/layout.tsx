import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { DashboardNavigationProvider } from '@/providers/DashboardNavigationProvider';
import { Suspense } from 'react';

export default function ClientLayout({
  children,
  initialView = 'dashboard'
}: {
  children: React.ReactNode;
  initialView?: any;
}) {
  return (
    <SidebarProvider>
      <Suspense>
        <DashboardNavigationProvider initialView={initialView}>
          <div className="flex min-h-screen bg-[#0A0A0A] w-full overflow-hidden print:bg-white">
            <Sidebar role="client" />
            <div className="flex flex-1 flex-col min-w-0 print:block">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 text-white w-full print:p-0 print:text-black print:overflow-visible">
                {children}
              </main>
            </div>
          </div>
        </DashboardNavigationProvider>
      </Suspense>
    </SidebarProvider>
  );
}
