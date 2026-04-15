'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/providers/AuthProvider'
import { useAppNavigation, AppView } from '@/providers/AppNavigationProvider'
import { Menu, X, LayoutDashboard, User, CreditCard, LogOut } from 'lucide-react'
import { cn, getSafePhotoUrl } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthContext()
  const { navigateTo } = useAppNavigation()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [imgError, setImgError] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Mobile-specific user initials
  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U' : '';
  const photo = getSafePhotoUrl(user?.profile_picture_url || user?.profile_picture);

  const handleNav = (view: AppView) => {
    navigateTo(view);
    setIsMenuOpen(false);
  };

  const handleDashboardNav = (subView: string) => {
    const role = user?.role?.toLowerCase() === 'admin' ? 'admin' : 'client';
    
    if (subView === 'profile') {
      router.push(`/${role}/profile`);
    } else if (subView === 'memberships') {
      router.push(`/${role}/memberships`);
    } else {
      router.push(`/${role}`);
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(17, 24, 39, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: '85px' }}>
          {/* Logo (left) */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center outline-none">
              <Image
                src="https://res.cloudinary.com/dry6dvzoj/image/upload/v1757729690/Forcegym_1_nxwdfw.png"
                alt="Forcegym"
                width={220}
                height={70}
                priority
                className="transition-all duration-500 hover:brightness-110"
                style={{ height: '125px', width: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}
              />
            </Link>
          </div>

            {/* Desktop Right End - Show Join buttons if not auth */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-5">
                <button
                  onClick={() => handleNav('login')}
                  className="font-medium px-5 py-2 transition-all duration-300 rounded-md text-white hover:text-red-500 text-[15px] outline-none"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="font-medium px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-red-600/20 text-[15px] outline-none"
                >
                  Únete
                </button>
              </div>
            )}

            {/* Hamburger Button & Menu */}
            <div className={cn("relative flex items-center", !isAuthenticated && "md:hidden")}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "p-2.5 rounded-xl border-2 transition-all duration-300 outline-none ml-4",
                  isMenuOpen 
                    ? "border-red-500 bg-red-500/10 text-white" 
                    : "border-white/20 bg-black/20 text-white hover:border-red-500/50 hover:bg-red-500/5"
                )}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Unified Navigation Menu */}
              {isMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-4 w-64 md:w-72 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
                >
                  {isAuthenticated ? (
                    <div className="p-2 space-y-1">
                      {/* User Header */}
                      <div className="flex items-center gap-3 p-4 mb-2 bg-white/5 rounded-xl">
                          <Avatar className="w-10 h-10 ring-2 ring-red-500/20">
                            {photo && !imgError ? (
                              <AvatarImage 
                                src={photo} 
                                alt={user?.first_name || 'User'} 
                                onError={() => setImgError(true)} 
                              />
                            ) : null}
                            <AvatarFallback className="bg-red-600 text-white font-bold flex items-center justify-center">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">{user?.first_name} {user?.last_name}</span>
                            <span className="text-[10px] text-gray-400 truncate uppercase tracking-widest">{user?.role}</span>
                          </div>
                      </div>

                      <MenuButton 
                        onClick={() => handleDashboardNav('profile')} 
                        icon={<User size={18} />} 
                        label="Mi Perfil" 
                      />
                      <MenuButton 
                        onClick={() => handleDashboardNav('dashboard')} 
                        icon={<LayoutDashboard size={18} />} 
                        label="Dashboard" 
                      />
                      {user?.role?.toLowerCase() !== 'admin' && (
                        <MenuButton 
                          onClick={() => handleDashboardNav('memberships')} 
                          icon={<CreditCard size={18} />} 
                          label="Membresía" 
                        />
                      )}
                      
                      <div className="my-2 border-t border-white/5 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 group font-bold text-sm"
                        >
                          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      <button
                         onClick={() => handleNav('login')}
                         className="w-full text-left px-5 py-3 text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
                      >
                        Iniciar Sesión
                      </button>
                      <button
                         onClick={() => handleNav('register')}
                         className="w-full text-center px-6 py-3 bg-red-600 text-white rounded-xl transition-all text-sm font-bold mt-2 shadow-lg shadow-red-600/20"
                      >
                        Únete Ahora
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  };

interface MenuButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const MenuButton = ({ label, icon, onClick }: MenuButtonProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group font-medium text-sm"
  >
    <div className="text-gray-500 group-hover:text-red-500 transition-colors">
      {icon}
    </div>
    {label}
  </button>
);

export default Navbar
