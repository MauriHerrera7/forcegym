"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  Video,
  User,
  HelpCircle,
  RefreshCw,
  X,
  Menu,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useSidebar } from "@/providers/SidebarProvider";
import { useAppNavigation } from "@/providers/AppNavigationProvider";
import { useAuthContext } from "@/providers/AuthProvider";

interface SidebarProps {
  role: "admin" | "client";
}

const adminMenuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/payments", label: "Pagos", icon: CreditCard },
  { href: "/admin/renewals", label: "Renovaciones", icon: RefreshCw },
] as const;

const clientMenuItems = [
  { href: "/client", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/profile", label: "Perfil", icon: User },
  { href: "/client/training", label: "Entrenamiento", icon: Dumbbell },
  { href: "/client/routines", label: "Rutinas", icon: ClipboardList },
  { href: "/client/memberships", label: "Membresías", icon: CreditCard },
  { href: "/client/support", label: "Soporte", icon: HelpCircle },
] as const;

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();
  const { navigateTo } = useAppNavigation();
  const { logout } = useAuthContext();
  const menuItems = role === "admin" ? adminMenuItems : clientMenuItems;

  // Hydration protection
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Navigation logic removed since we use native Links now

  const handleLogoClick = () => {
    navigateTo('landing');
    router.push('/');
    close();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mounted && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-[#2D0A0A] border-r border-[#450A0A]/30 transition-all duration-300 md:sticky md:top-0 md:shrink-0 overflow-hidden no-print print-hidden layout-sidebar",
          isOpen 
            ? "translate-x-0 w-64" 
            : "-translate-x-full w-0 md:translate-x-0 md:w-0 md:border-none"
        )}
      >
        {/* Logo & Toggle Button */}
        <div className="flex h-24 items-center justify-between px-6 min-w-64">
          <button onClick={handleLogoClick} className="outline-none">
            <Image
              src="https://res.cloudinary.com/dry6dvzoj/image/upload/v1757729690/Forcegym_1_nxwdfw.png"
              alt="ForceGym Logo"
              width={150}
              height={50}
              className="h-auto w-auto hover:opacity-80 transition-opacity"
              priority
            />
          </button>
          <button
            onClick={close}
            className="rounded-lg p-2 text-gray-400 hover:bg-[#404040] hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto min-w-64">
          {menuItems.map((item: any) => {
            const Icon = item.icon;
            const isDashboard = item.href === '/admin' || item.href === '/client';
            const isActive = isDashboard 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                href={item.href}
                key={item.href}
                onClick={close}
                className={cn(
                  "flex items-center w-full gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 text-left",
                  isActive
                    ? "bg-[#ff0400] text-white shadow-lg shadow-[#ff0400]/20 font-black italic uppercase tracking-tighter"
                    : "text-gray-400 hover:bg-[#404040] hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 opacity-50")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-[#450A0A]/30 min-w-64 bg-[#2D0A0A]">
          <button
            onClick={() => {
              logout();
              router.push('/');
              close();
            }}
            className="flex items-center w-full gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 text-gray-400 hover:bg-[#ff0400]/10 hover:text-[#ff0400] group"
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-[#ff0400] transition-colors" />
            <span className="uppercase tracking-wider font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
