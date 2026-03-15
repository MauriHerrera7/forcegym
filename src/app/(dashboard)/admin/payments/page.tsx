'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin, AdminPayment } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, Search, CreditCard, User, Calendar, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useConfirm } from '@/providers/ConfirmDialogProvider';

export default function AdminPaymentsPage() {
  const { confirm } = useConfirm();
  const { getPayments, approvePayment, deletePayment, loading: adminLoading } = useAdmin();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [getPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleApprove = async (paymentId: string) => {
    confirm({
      title: '¿Aprobar pago manualmente?',
      description: 'Esto activará la membresía del usuario.',
      confirmText: 'Aprobar',
      onConfirm: async () => {
        setApproving(paymentId);
        try {
          await approvePayment(paymentId);
          await fetchPayments(); // Refresh list
          toast.success('Pago aprobado exitosamente');
        } catch (err) {
          console.error('Error approving payment:', err);
          toast.error('Error al aprobar el pago');
        } finally {
          setApproving(null);
        }
      }
    });
  };

  const handleDelete = async (paymentId: string) => {
    confirm({
      title: '¿Eliminar registro de pago?',
      description: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'destructive',
      onConfirm: async () => {
        setDeleting(paymentId);
        try {
          await deletePayment(paymentId);
          await fetchPayments(); // Refresh list
          toast.success('Pago eliminado');
        } catch (err) {
          console.error('Error deleting payment:', err);
          toast.error('Error al eliminar el pago');
        } finally {
          setDeleting(null);
        }
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pagado</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendiente</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Fallido</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchStr = `${payment.user_name || ''} ${payment.id}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 p-2 sm:p-6 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Historial de Pagos</h1>
          <p className="text-gray-400 text-sm">Ver y gestionar todas las transacciones del gimnasio</p>
        </div>
      </div>

      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-white">Transacciones</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuario o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#191919] border-[#404040] text-white focus:border-[#ff0400]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-[#ff0400]" />
            </div>
          ) : (
            <>
              {/* Mobile View (Cards) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="bg-[#202020] p-4 rounded-xl border border-[#404040] space-y-4">
                    {/* Header: User & Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ff0400] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {payment.user_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{payment.user_name || 'Usuario'}</p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                         {getStatusBadge(payment.status)}
                      </div>
                    </div>

                    {/* Body: Concept & Amount */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#404040]/50">
                       <div>
                         <p className="text-xs text-gray-500 mb-1">Concepto</p>
                         <p className="text-sm text-gray-300">{payment.membership?.plan.name || 'Membresía'}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xs text-gray-500 mb-1">Monto</p>
                         <p className="text-lg font-bold text-white">${payment.amount}</p>
                       </div>
                    </div>

                    {/* Footer: Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                      {payment.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(payment.id)}
                          disabled={!!approving || !!deleting}
                          className="bg-[#ff0400] hover:bg-[#ff3936] text-white gap-2 flex-1"
                        >
                          {approving === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Aprobar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(payment.id)}
                        disabled={!!approving || !!deleting}
                        className="border-red-500/30 hover:bg-red-500/20 text-red-400 px-3"
                      >
                        {deleting === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredPayments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm italic">No se encontraron pagos registrados.</p>
                  </div>
                )}
              </div>

              {/* Desktop View (Table) */}
              <div className="hidden md:block w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#404040]">
                    <TableHead className="text-gray-400 whitespace-nowrap py-3">Fecha</TableHead>
                    <TableHead className="text-gray-400 whitespace-nowrap py-3">Usuario</TableHead>
                    <TableHead className="text-gray-400 whitespace-nowrap py-3">Concepto</TableHead>
                    <TableHead className="text-gray-400 whitespace-nowrap py-3">Monto</TableHead>
                    <TableHead className="text-gray-400 whitespace-nowrap py-3">Estado</TableHead>
                    <TableHead className="text-gray-400 text-right py-3">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-[#404040]/50 hover:bg-[#404040]/20 transition-colors">
                      <TableCell className="py-4 text-sm text-gray-300">
                        {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#ff0400] flex items-center justify-center text-white text-xs font-bold">
                            {payment.user_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {payment.user_name || 'Usuario'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-300">
                        {payment.membership?.plan.name || 'Membresía'}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-bold text-white">
                        ${payment.amount}
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(payment.id)}
                              disabled={!!approving || !!deleting}
                              className="bg-[#ff0400] hover:bg-[#ff3936] text-white gap-2"
                            >
                              {approving === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              Aprobar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(payment.id)}
                            disabled={!!approving || !!deleting}
                            className="border-red-500/30 hover:bg-red-500/20 text-red-400 px-3"
                          >
                            {deleting === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-500 italic">
                        No se encontraron pagos registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
