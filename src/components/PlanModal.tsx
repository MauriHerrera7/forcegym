'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { fetchApi } from '@/lib/api'
import { useMembership, MembershipPlan } from '@/hooks/useMembership'
import { Loader2 } from 'lucide-react'

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
}

const planStyles = {
  'Mensual': {
    color: 'orange',
    emoji: '🟠',
    gradient: 'from-[#FF6B35] to-[#FF8C42]',
    border: 'border-[#FF6B35]/30',
    dot: 'bg-[#FF6B35]',
    glow: 'shadow-[0_20px_80px_rgba(255,107,53,0.15)]',
    cardGlow: 'group-hover:shadow-[0_20px_80px_rgba(255,107,53,0.3)]'
  },
  'Trimestral': {
    color: 'red',
    emoji: '🔴',
    gradient: 'from-[#DC143C] to-[#FF1744]',
    border: 'border-[#DC143C]/30',
    dot: 'bg-[#DC143C]',
    glow: 'shadow-[0_20px_80px_rgba(220,20,60,0.15)]',
    cardGlow: 'group-hover:shadow-[0_20px_80px_rgba(220,20,60,0.3)]'
  },
  'Semestral': {
    color: 'purple',
    emoji: '🟣',
    gradient: 'from-[#9333EA] to-[#A855F7]',
    border: 'border-[#9333EA]/30',
    dot: 'bg-[#9333EA]',
    glow: 'shadow-[0_20px_80px_rgba(147,51,234,0.15)]',
    cardGlow: 'group-hover:shadow-[0_20px_80px_rgba(147,51,234,0.3)]'
  },
  'Anual': {
    color: 'yellow',
    emoji: '🟡',
    gradient: 'from-[#F59E0B] to-[#FBBF24]',
    border: 'border-[#F59E0B]/30',
    dot: 'bg-[#F59E0B]',
    glow: 'shadow-[0_20px_80px_rgba(245,158,11,0.15)]',
    cardGlow: 'group-hover:shadow-[0_20px_80px_rgba(245,158,11,0.3)]'
  }
} as const

const defaultPlanStyle = {
  color: 'zinc',
  emoji: '⚪',
  gradient: 'from-[#71717A] to-[#A1A1AA]',
  border: 'border-[#71717A]/30',
  dot: 'bg-[#71717A]',
  glow: 'shadow-[0_20px_80px_rgba(113,113,122,0.15)]',
  cardGlow: 'group-hover:shadow-[0_20px_80px_rgba(113,113,122,0.3)]'
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const { activeMembership } = useMembership()
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const fetchPlans = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchApi('/memberships/plans/?page_size=100')
          console.log('[PlanModal] API Response:', data)
          
          // Solo mostrar los activos y ordenarlos por precio
          const plansData = data?.results || data
          
          if (!Array.isArray(plansData)) {
            console.error('[PlanModal] Unexpected API format:', data)
            setPlans([])
            return
          }

          const activePlans = plansData
            .filter((p: any) => p.is_active)
            .sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))
          
          setPlans(activePlans)
        } catch (err: any) {
          console.error('[PlanModal] Error fetching plans:', err)
          setError(err.message || 'Error al cargar los planes')
        } finally {
          setLoading(false)
        }
      }
      fetchPlans()
    }
  }, [isOpen])

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId)
    try {
      const response = await fetchApi('/payments/create_with_membership/', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId }),
      })
      
      if (response && response.init_point) {
        window.location.href = response.init_point
      }
    } catch (error: any) {
      console.error('Error initiating purchase:', error)
      alert(error.message || 'Error al procesar el pago. Por favor intenta de nuevo.')
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-[#0B0B0B] border-[#1F1F1F] text-white p-0 overflow-hidden sm:rounded-3xl">
        <div className="p-6 md:p-12 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-12 text-center">
            <DialogTitle className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic text-white">
              Eleva tu <span className="text-apple-red">Potencial.</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm md:text-lg max-w-2xl mx-auto mt-4">
              Elegí el compromiso que mejor se adapte a tu transformación. 
              <span className="text-white block font-bold">Un solo pago. Acceso total.</span>
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-apple-red" />
              <p className="text-zinc-500 animate-pulse font-medium">Cargando planes técnicos...</p>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center text-center gap-4 px-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white">Error de conexión</h3>
              <p className="text-zinc-400 max-w-md">{error}</p>
              <Button 
                onClick={() => onClose()} 
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Cerrar
              </Button>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center gap-4 px-4">
              <div className="w-16 h-16 rounded-full bg-apple-red/10 flex items-center justify-center mb-2">
                <span className="text-3xl">🥋</span>
              </div>
              <h3 className="text-xl font-bold text-white">No hay planes disponibles</h3>
              <p className="text-zinc-400 max-w-md">Estamos actualizando nuestra oferta para brindarte el mejor rendimiento. Vuelve pronto.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const style = planStyles[plan.name as keyof typeof planStyles] || defaultPlanStyle
                const isExpired = activeMembership && (activeMembership.status === 'EXPIRED' || new Date(activeMembership.end_date) < new Date());
                const isSamePlan = activeMembership?.plan?.id === plan.id;

                return (
                  <div 
                    key={plan.id}
                    className={`group relative flex flex-col p-8 lg:p-10 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl border ${style.border} transition-all duration-700 hover:scale-[1.03] ${style.cardGlow}`}
                  >
                    {/* Animated glow effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${style.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700`} />

                    {/* Badge Emoji */}
                    <div className="relative z-10 text-5xl mb-6">{style.emoji}</div>

                    <div className="relative z-10 mb-8">
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white leading-none">
                        {plan.name}
                      </h3>
                      <div className={`w-16 h-1 rounded-full bg-gradient-to-r ${style.gradient} mt-3`} />
                      
                      <div className="flex items-baseline gap-1 mt-6">
                        <span className="text-5xl font-black text-white italic tracking-tighter">
                          ${Math.floor(parseFloat(plan.price as any)).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-xs font-black uppercase tracking-[0.3em] mt-2 italic">
                        {plan.duration_days} DÍAS ACCESO
                      </div>
                    </div>

                    <div className="relative z-10 flex-1 space-y-4 mb-10">
                      {plan.features?.map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 group/item transition-colors hover:text-white">
                          <div className={`w-2 h-2 rounded-full ${style.dot} mt-2 shrink-0 transition-transform group-hover/item:scale-150`} />
                          <span className="text-sm text-zinc-300 font-medium leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={!!purchasing || (isSamePlan && !isExpired)}
                      className={`relative z-10 w-full py-6 md:py-7 rounded-2xl font-black uppercase tracking-tight transition-all duration-500 overflow-hidden group/btn 
                        ${purchasing === plan.id || (isSamePlan && !isExpired)
                          ? 'bg-zinc-800 text-zinc-500' 
                          : 'bg-white text-black hover:text-white scale-100 active:scale-95 shadow-2xl'
                        }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-[10px] md:text-xs">
                        {purchasing === plan.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (isSamePlan && !isExpired) ? (
                          'Ya obtenido'
                        ) : (
                          'Obtener membresía'
                        )}
                      </span>
                      {(!isSamePlan || isExpired) && (
                        <div className="absolute inset-0 bg-[#ff0400] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-zinc-500 text-sm font-medium">
              Todos los planes incluyen acceso total a musculación, cardio y ecosistema digital.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
