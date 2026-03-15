'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin, AdminPayment } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Search, CreditCard, User, Calendar, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConfirm } from '@/providers/ConfirmDialogProvider';

export default function AdminPaymentsView() {
  const { confirm } = useConfirm();
  const { getPayments, approvePayment, deletePayment, loading: adminLoading } = useAdmin();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [approving, setApproving] = useState<string | null>(null);

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
      title: '¿Apobar pago manualmente?',
      description: 'Esto activará la membresía del usuario.',
      confirmText: 'Aprobar',
      onConfirm: async () => {
        setApproving(paymentId);
        try {
          await approvePayment(paymentId);
          await fetchPayments();
        } catch (err) {
          console.error('Error approving payment:', err);
        } finally {
          setApproving(null);
        }
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge className="bg-green-500/20 text-green-400 border-green-500/20 uppercase text-[10px] font-black">Pagado</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20 uppercase text-[10px] font-black">Pendiente</Badge>;
      case 'FAILED': return <Badge className="bg-red-500/20 text-red-400 border-red-500/20 uppercase text-[10px] font-black">Fallido</Badge>;
      default: return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/20 lg uppercase text-[10px] font-black">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchStr = `${payment.user_name || ''} ${payment.id}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
            Historial de Pagos {loading && <Loader2 className="h-4 w-4 animate-spin inline ml-2 text-[#ff0400]" />}
          </h1>
          <p className="text-zinc-500 font-medium text-sm">Registro de transacciones y membresías</p>
        </div>
      </div>

      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle className="text-white text-xl font-normal">Transacciones</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Buscar por usuario o ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111] border-[#333] text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#333] text-left">
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Fecha</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Usuario</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Plan</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Monto</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Estado</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="group">
                    <td className="py-4 text-xs font-bold text-zinc-400 uppercase italic">
                      {format(new Date(payment.created_at), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[#ff0400] text-xs font-black italic border border-[#333]">
                            {payment.user_name?.[0] || 'U'}
                          </div>
                          <span className="font-black text-white italic uppercase tracking-tight text-sm">
                            {payment.user_name}
                          </span>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-medium text-zinc-400">
                      {payment.membership?.plan.name || 'Membresía'}
                    </td>
                    <td className="py-4 font-black text-white italic">
                      ${payment.amount}
                    </td>
                    <td className="py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-4 text-right">
                      {payment.status === 'PENDING' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(payment.id)}
                          disabled={!!approving}
                          className="bg-[#ff0400] hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] px-4"
                        >
                          {approving === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aprobar'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
