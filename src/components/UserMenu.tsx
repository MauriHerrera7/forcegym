'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useAuthContext } from '@/providers/AuthProvider'
import { useAppNavigation } from '@/providers/AppNavigationProvider'
import { useDashboardNavigationSafe } from '@/providers/DashboardNavigationProvider'

interface UserMenuProps {
  userImage?: string
  userName?: string
}

export default function UserMenu({ userImage: propImage, userName: propName }: UserMenuProps) {
  const { user, logout } = useAuthContext()
  const { navigateTo } = useAppNavigation()
  // Safe: returns null when outside DashboardNavigationProvider (e.g. on Landing Navbar)
  const dashboardNav = useDashboardNavigationSafe()

  const [isOpen, setIsOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDashboardClick = () => {
    const roleView = user?.role?.toUpperCase() === 'ADMIN' ? 'admin' : 'client'
    navigateTo(roleView as any)
    dashboardNav?.setCurrentView('dashboard')
    setIsOpen(false)
  }

  const handleProfileClick = () => {
    const roleView = user?.role?.toUpperCase() === 'ADMIN' ? 'admin' : 'client'
    navigateTo(roleView as any)
    dashboardNav?.setCurrentView('profile')
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigateTo('landing')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const getSafePhoto = () => {
    const raw = (user?.profile_picture_url || user?.profile_picture || propImage);
    if (!raw || typeof raw !== 'string' || raw.length < 5) return '';
    const lower = raw.toLowerCase().trim();
    if (lower.includes('/null') || lower.includes('/undefined') || lower === 'null' || lower === 'undefined') return '';
    if (raw.startsWith('http')) return raw.trim();
    if (raw.startsWith('/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      return `${cleanBase}${raw}`;
    }
    return '';
  }
  
  const photo = getSafePhoto()
  const firstName = user?.first_name || propName?.split(' ')[0] || ''
  const lastName = user?.last_name || propName?.split(' ').slice(1).join(' ') || ''
  const fullName = `${firstName} ${lastName}`.trim() || propName || 'Usuario'
  
  const getInitials = () => {
    if (user?.first_name || user?.last_name) {
      const first = (user.first_name || '').charAt(0);
      const last = (user.last_name || '').charAt(0);
      return `${first}${last}`.toUpperCase() || 'U';
    }
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (propName && propName !== 'Usuario') {
      const parts = propName.split(' ');
      if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      return parts[0].charAt(0).toUpperCase();
    }
    return 'U';
  };
  const initials = getInitials();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none cursor-pointer"
      >
        <div 
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-apple-red hover:border-apple-red/80 transition-colors duration-200 flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: '#ff0800' }}
        >
          <span className="text-white text-xl font-bold select-none">{initials}</span>
          {photo && !imgError && (
            <Image src={photo} alt={fullName} fill style={{ objectFit: 'cover' }} className="rounded-full" onError={() => setImgError(true)} />
          )}
        </div>
        <span className="hidden md:block text-xs font-bold text-white uppercase tracking-tight cursor-pointer">{fullName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-lg shadow-lg py-1 bg-gray-900 border border-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
            <div 
              className="relative w-9 h-9 rounded-full overflow-hidden border border-apple-red flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: '#ff0800' }}
            >
              <span className="text-white text-sm font-bold select-none">{initials}</span>
              {photo && !imgError && (
                <Image src={photo} alt={fullName} fill style={{ objectFit: 'cover' }} className="rounded-full" onError={() => setImgError(true)} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={handleDashboardClick}
            className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 outline-none"
          >
            Dashboard
          </button>
          <button
            onClick={handleProfileClick}
            className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 outline-none"
          >
            Mi Perfil
          </button>
          <button
            onClick={() => { handleLogout(); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}