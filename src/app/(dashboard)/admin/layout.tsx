import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { DashboardNavigationProvider } from '@/providers/DashboardNavigationProvider';
import { Suspense } from 'react';

export default function AdminLayout({
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
          <div className="flex min-h-screen bg-[#0A0A0A] w-full overflow-hidden">
            <Sidebar role="admin" />
            <div className="flex flex-1 flex-col min-w-0">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 md:p-8 text-white w-full">
                {children}
              </main>
            </div>
          </div>
        </DashboardNavigationProvider>
      </Suspense>
    </SidebarProvider>
  );
}
