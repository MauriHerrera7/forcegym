'use client';

import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, CreditCard, UserCircle, X, ChevronsRight } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useMembership } from '@/hooks/useMembership';
import { usePlanModal } from '@/providers/PlanModalProvider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  icon: React.ReactNode;
  title: string;
  message: string;
  link?: string;
  linkLabel?: string;
  onClick?: () => void;
}

export function NotificationPanel() {
  const { user } = useAuthContext();
  const { activeMembership } = useMembership();
  const { openPlanModal } = usePlanModal();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedDismissed = localStorage.getItem('dismissed_notifications');
    if (savedDismissed) {
      try {
        setDismissed(new Set(JSON.parse(savedDismissed)));
      } catch (e) {
        console.error('Error parsing dismissed notifications', e);
      }
    }
    setMounted(true);
  }, []);

  const dismiss = (id: string) => {
    setDismissed(prev => {
      const next = new Set(prev).add(id);
      localStorage.setItem('dismissed_notifications', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Build smart notifications based on real user data
  const notifications: Notification[] = [];

  // 1. Missing profile data
  const missingFields: string[] = [];
  if (!user?.phone) missingFields.push('teléfono');
  if (!user?.birthdate) missingFields.push('fecha de nacimiento');
  if (!user?.profile_picture_url && !user?.profile_picture) missingFields.push('foto de perfil');

  if (missingFields.length > 0) {
    notifications.push({
      id: 'missing-data',
      type: 'warning',
      icon: <UserCircle className="h-5 w-5 text-yellow-400" />,
      title: 'Perfil incompleto',
      message: `Faltan datos en tu perfil: ${missingFields.join(', ')}.`,
      link: '/client/profile',
      linkLabel: 'Completar perfil',
    });
  }

  // 2. Membership status
  if (!activeMembership) {
    notifications.push({
      id: 'no-membership',
      type: 'error',
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      title: 'Sin membresía activa',
      message: 'No tienes una membresía activa. Adquiere un plan para acceder a todos los beneficios.',
      onClick: openPlanModal,
      linkLabel: 'Ver planes',
    });
  } else {
    // Check if membership is close to expiring (within 7 days)
    const expirationDate = activeMembership.end_date ? new Date(activeMembership.end_date) : null;
    const today = new Date();
    const daysLeft = expirationDate
      ? Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (daysLeft !== null && daysLeft < 0) {
      notifications.push({
        id: 'membership-expired',
        type: 'error',
        icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
        title: 'Membresía vencida',
        message: 'Tu membresía ha vencido. Renueva tu plan para seguir entrenando.',
        onClick: openPlanModal,
        linkLabel: 'Renovar ahora',
      });
    } else if (daysLeft !== null && daysLeft <= 7) {
      notifications.push({
        id: 'membership-expiring',
        type: 'warning',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
        title: 'Membresía por vencer',
        message: `Tu membresía vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}. ¡Renueva para no perder el acceso!`,
        onClick: openPlanModal,
        linkLabel: 'Renovar plan',
      });
    } else if (activeMembership.status === 'ACTIVE') {
      notifications.push({
        id: 'membership-active',
        type: 'success',
        icon: <CheckCircle className="h-5 w-5 text-green-400" />,
        title: 'Membresía activa',
        message: `Tu plan "${activeMembership.plan?.name}" está activo${expirationDate ? ` hasta el ${expirationDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}` : ''}.`,
      });
    }

    // Payment notification (last payment info)
    if (activeMembership.status === 'ACTIVE') {
      notifications.push({
        id: 'payment-ok',
        type: 'info',
        icon: <CreditCard className="h-5 w-5 text-blue-400" />,
        title: 'Pago registrado',
        message: `Pago del plan "${activeMembership.plan?.name}" registrado correctamente.`,
      });
    }
  }

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));
  const unreadCount = visibleNotifications.length;

  const colorMap = {
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    success: 'border-green-500/30 bg-green-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
    error: 'border-red-500/30 bg-red-500/5',
  };

  if (!mounted) return (
    <div className="relative">
      <button className="relative rounded-full p-2 text-gray-400">
        <Bell className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-[#404040] hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-[#ff0400] text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[#2a2a2a] bg-[#111111] shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#ff0400]" />
                <span className="text-sm font-bold text-white">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#ff0400] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#1e1e1e]">
              {visibleNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-60" />
                  <p className="text-sm text-gray-500">Todo está en orden</p>
                </div>
              ) : (
                visibleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-l-2 transition-colors hover:bg-white/5',
                      colorMap[notif.type]
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">{notif.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-tight">{notif.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#ff0400] hover:underline font-semibold"
                        >
                          {notif.linkLabel}
                          <ChevronsRight className="h-3 w-3" />
                        </Link>
                      )}
                      {notif.onClick && (
                        <button
                          onClick={() => {
                            notif.onClick?.();
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#ff0400] hover:underline font-semibold"
                        >
                          {notif.linkLabel}
                          <ChevronsRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {/* Dismiss button */}
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="flex-shrink-0 text-gray-600 hover:text-white transition-colors mt-0.5"
                      title="Descartar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[#2a2a2a]">
              <p className="text-[10px] text-[#ff0400] text-center uppercase tracking-widest font-semibold">
                Force Gym · Notificaciones
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
