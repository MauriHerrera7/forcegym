'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMembership } from '@/hooks/useMembership'
import { usePayments } from '@/hooks/usePayments'
import { Loader2, Calendar, CreditCard, CheckCircle2, AlertCircle, Clock, ShoppingCart, Trash2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import PlanModal from '@/components/PlanModal'
import { toast } from 'sonner'
import { useConfirm } from '@/providers/ConfirmDialogProvider'

export default function ClientMembershipsPage() {
  const { confirm } = useConfirm()
  const { activeMembership, loading: membershipLoading } = useMembership()
  const { payments, loading: paymentsLoading, deletePayment, retryPayment } = usePayments()
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  const isLoading = membershipLoading || paymentsLoading

  const handleRetryPayment = async (paymentId: string) => {
    setRetryingId(paymentId)
    try {
      const response = await retryPayment(paymentId)
      if (response && response.init_point) {
        window.location.href = response.init_point
      }
    } catch (error: any) {
      console.error('Error retrying payment:', error)
      toast.error(error.message || 'Error al iniciar el pago.')
    } finally {
      setRetryingId(null)
    }
  }

  const handleDelete = async (paymentId: string) => {
    confirm({
      title: '¿Eliminar registro de pago?',
      description: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'destructive',
      onConfirm: async () => {
        await deletePayment(paymentId)
        toast.success('Pago eliminado exitosamente')
      }
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PAID':
      case 'APPROVED':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Confirmado</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 uppercase italic font-black text-[10px] tracking-widest px-3 py-1">Pendiente</Badge>
      case 'EXPIRED':
      case 'FAILED':
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Rechazado</Badge>
      default:
        return <Badge className="bg-zinc-500/20 text-zinc-500 border-zinc-500/50">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-apple-red" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 p-4 sm:p-6 pb-12">
      {/* ... previous content until Payment History ... */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
        <div className="space-y-2 animate-in slide-in-from-left duration-700">
          <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">
            Tu <span className="text-apple-red">Membresía.</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">
            Control de acceso y evolución técnica
          </p>
        </div>
        
        <Button 
          onClick={() => setIsPlanModalOpen(true)}
          className="bg-apple-red hover:bg-red-600 text-white font-black italic uppercase tracking-tight px-8 py-6 h-auto animate-in fade-in zoom-in duration-500"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Adquirir Membresía
        </Button>
      </div>

      {activeMembership ? (
        <Card className="bg-apple-black border-[#222] overflow-hidden group hover:border-apple-red/50 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="w-32 h-32 text-apple-red" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">Membresía Activa</CardTitle>
              {getStatusBadge(activeMembership.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter">
                  {activeMembership?.plan?.name}
                </h3>
                <p className="text-zinc-400 font-medium">{activeMembership?.plan?.description}</p>
              </div>
              <div className="bg-[#111] p-6 rounded-2xl border border-zinc-800/50 transition-colors group-hover:border-apple-red/30">
                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Precio Mensual</div>
                <div className="text-4xl font-black text-white italic">${activeMembership?.plan?.price}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 bg-zinc-900/40 p-5 rounded-xl border border-white/5">
                <div className="p-3 bg-apple-red/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-apple-red" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inicia el</p>
                  <p className="text-sm font-bold text-white uppercase italic">
                    {format(new Date(activeMembership.start_date), "d MMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-zinc-900/40 p-5 rounded-xl border border-white/5">
                <div className="p-3 bg-apple-red/10 rounded-lg">
                  <Clock className="h-6 w-6 text-apple-red" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vence el</p>
                  <p className="text-sm font-bold text-white uppercase italic">
                    {format(new Date(activeMembership.end_date), "d MMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-zinc-900/40 p-5 rounded-xl border border-white/5">
                <div className="p-3 bg-apple-red/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-apple-red" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Auto Renovación</p>
                  <p className="text-sm font-bold text-white uppercase italic">
                    {activeMembership.auto_renew ? 'Activada' : 'Desactivada'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-apple-black border-dashed border-zinc-800 py-16">
          <CardContent className="flex flex-col items-center text-center space-y-6">
            <div className="p-6 bg-zinc-900 rounded-full border border-zinc-800">
              <AlertCircle className="h-12 w-12 text-zinc-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Sin Membresía Activa</h3>
              <p className="text-zinc-500 max-w-md">Para acceder a las instalaciones y clases grupales, necesitás activar un plan de entrenamiento.</p>
            </div>
            <Button 
                onClick={() => setIsPlanModalOpen(true)}
                className="bg-white text-black hover:!bg-[#ff0400] hover:!text-white font-black italic uppercase tracking-tight px-12 py-7 h-auto transition-all border-none"
            >
              Ver Planes Disponibles
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <div className="space-y-6">
        <h2 className="text-xl font-black italic uppercase tracking-widest text-zinc-300">Historial de Pagos</h2>
        <Card className="bg-[#0D0D0D] border-zinc-900 overflow-hidden shadow-xl">
          <CardContent className="p-0">
            {payments.length > 0 ? (
              <div className="w-full">
                {/* Mobile View (Cards) */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                  {payments.map((payment) => (
                    <div key={payment.id} className="bg-zinc-900/40 p-5 rounded-xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Concepto</p>
                          <p className="text-sm font-bold text-white uppercase italic">{payment.membership?.plan?.name || 'Membresía'}</p>
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="flex justify-between items-end pt-3 border-t border-zinc-800">
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Fecha</p>
                          <p className="text-sm font-bold text-white whitespace-nowrap">
                            {format(new Date(payment.created_at), "dd/MM/yyyy", { locale: es })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Monto</p>
                          <p className="text-lg font-black text-apple-red italic">${payment.amount}</p>
                        </div>
                      </div>

                          <div className="flex gap-2 pt-2">
                            {payment.status === 'PENDING' && (
                              <Button 
                                onClick={() => handleRetryPayment(payment.id)}
                                disabled={!!retryingId}
                                className="flex-1 bg-[#ff0400] hover:bg-red-600 text-white font-black italic uppercase tracking-tighter text-xs h-10 border-none shadow-lg shadow-red-500/20"
                              >
                                {retryingId === payment.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ExternalLink className="h-3 w-3 mr-2" />}
                                Pagar ahora
                              </Button>
                            )}
                        <Button 
                          onClick={() => handleDelete(payment.id)}
                          variant="ghost"
                          className="w-10 h-10 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Fecha</TableHead>
                        <TableHead className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Concepto</TableHead>
                        <TableHead className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Monto</TableHead>
                        <TableHead className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Estado</TableHead>
                        <TableHead className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id} className="border-zinc-900 hover:bg-white/[0.02] transition-colors group/row">
                          <TableCell className="px-6 py-5 text-sm font-bold text-white whitespace-nowrap">
                            {format(new Date(payment.created_at), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell className="px-6 py-5 text-sm text-zinc-400 whitespace-nowrap">
                             {payment.membership?.plan?.name || 'Membresía'}
                          </TableCell>
                          <TableCell className="px-6 py-5 text-sm font-black text-white whitespace-nowrap">
                            ${payment.amount}
                          </TableCell>
                          <TableCell className="px-6 py-5 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="px-6 py-5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-3">
                              {payment.status === 'PENDING' && (
                                <Button 
                                  onClick={() => handleRetryPayment(payment.id)}
                                  disabled={!!retryingId}
                                  size="sm"
                                  className="bg-[#ff0400] hover:bg-red-600 text-white font-black italic uppercase tracking-tighter text-[10px] h-8 px-4 border-none shadow-lg shadow-red-500/20"
                                >
                                  {retryingId === payment.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ExternalLink className="h-3 w-3 mr-1" />}
                                  Pagar ahora
                                </Button>
                              )}
                              <Button 
                                onClick={() => handleDelete(payment.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-600 hover:text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-600 italic font-bold">
                No hay transacciones registradas.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
    </div>
  )
}
