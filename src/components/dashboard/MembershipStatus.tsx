import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MembershipStatusProps {
  membership: {
    plan_name: string;
    status: string;
    end_date: string;
    days_remaining: number | null;
  } | null;
  alert: boolean;
  loading?: boolean;
  onAcquirePlan?: () => void;
}

export function MembershipStatus({ membership, alert, loading, onAcquirePlan }: MembershipStatusProps) {
  if (loading) {
    return (
      <Card className="bg-[#191919] border-[#404040] animate-pulse">
        <div className="h-32" />
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card className="bg-[#191919] border-[#404040] border-dashed border-red-500/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white font-normal flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            Estado de Membresía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>No tienes una membresía activa.</span>
          </div>
          <button 
            onClick={onAcquirePlan}
            className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
          >
            Adquirir Plan
          </button>
        </CardContent>
      </Card>
    );
  }

  const isExpired = membership.status === 'EXPIRED' || (membership.days_remaining !== null && membership.days_remaining <= 0);

  return (
    <Card className={cn(
      "bg-[#191919] border-[#404040]",
      (alert || isExpired) && "border-yellow-500/50"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-white font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Membresía
          </div>
          <span className={cn(
            "text-[11px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wider",
            isExpired ? "bg-red-500/10 text-red-500" : membership.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
          )}>
            {isExpired ? 'Vencida' : membership.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-white font-bold">{membership.plan_name}</p>
            <p className="text-xs text-gray-400">Vence el {new Date(membership.end_date).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#404040]">
            <span className="text-xs text-gray-500 font-medium">Días restantes</span>
            <span className={cn(
              "text-lg font-bold",
              isExpired ? "text-red-500" : alert ? "text-yellow-500" : "text-white"
            )}>
              {isExpired ? 'Membresía vencida' : membership.days_remaining}
            </span>
          </div>

          {isExpired && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Rutina vencida, lista para renovar</span>
              </div>
              <Button 
                onClick={onAcquirePlan}
                className="w-full h-9 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-tighter text-xs"
              >
                Renovar Membresía
              </Button>
            </div>
          )}

          {!isExpired && alert && (
            <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-[10px] text-yellow-500">Tu membresía está por vencer</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
