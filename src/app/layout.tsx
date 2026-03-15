import type { Metadata } from "next";
import { Montserrat, Bebas_Neue, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppNavigationProvider, AppView } from "@/providers/AppNavigationProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Toaster } from 'sonner';
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-brush",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Forcegym",
  description: "Tu gimnasio de confianza",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialAppView = (cookieStore.get("forcegym_app_view")?.value as AppView) || "landing";
  const initialDashboardView = cookieStore.get("forcegym_dashboard_view")?.value || "dashboard";

  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${bebasNeue.variable} ${permanentMarker.variable} antialiased font-body`}
      >
        <AuthProvider>
          <AppNavigationProvider 
            initialView={initialAppView} 
            initialDashboardView={initialDashboardView as any}
          >
            <ConfirmDialogProvider>
              <ConditionalNavbar />
              <Toaster richColors position="top-center" />
              {children}
            </ConfirmDialogProvider>
          </AppNavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
