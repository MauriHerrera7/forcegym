'use client';

import React from 'react';

import { Dumbbell, Flame, Clock, Calendar, Target, TrendingDown, TrendingUp, Scale, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { UnifiedCalendar } from '@/components/dashboard/UnifiedCalendar';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { WeightProgressChart } from '@/components/dashboard/WeightProgressChart';
import { RoutineOverview } from '@/components/dashboard/RoutineOverview';
import { MembershipStatus } from '@/components/dashboard/MembershipStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthContext } from '@/providers/AuthProvider';
import { usePlanModal } from '@/providers/PlanModalProvider';

export default function ClientDashboardHome() {
  const { user, fetchUser } = useAuthContext();
  const { openPlanModal } = usePlanModal();
  const { data, loading, error, toggleAttendance, logWeight } = useClientDashboard();
  const [isAlertDismissed, setIsAlertDismissed] = React.useState(false);

  React.useEffect(() => {
    if (user?.id) {
      const now = new Date();
      const monthKey = `weight_alert_dismissed_${user.id}_${now.getFullYear()}_${now.getMonth()}`;
      const isDismissed = localStorage.getItem(monthKey) === 'true';
      setIsAlertDismissed(isDismissed);
    }
  }, [user]);

  const handleDismissAlert = () => {
    if (user?.id) {
      const now = new Date();
      const monthKey = `weight_alert_dismissed_${user.id}_${now.getFullYear()}_${now.getMonth()}`;
      localStorage.setItem(monthKey, 'true');
      setIsAlertDismissed(true);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Reintentar</button>
      </div>
    );
  }

  const weightTrend = React.useMemo(() => {
    if (!data?.weight_progress || data.weight_progress.length < 2) return '0';
    
    const sorted = [...data.weight_progress].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    
    const latestDate = new Date(latest.date);
    const firstOfCurrentMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    
    const previousMonthRecord = sorted
      .filter(log => new Date(log.date) < firstOfCurrentMonth)
      .pop();
      
    if (!previousMonthRecord) {
      // Fallback: If it's the first month, compare against first log of month
      const firstOfMonth = sorted.find(log => new Date(log.date) >= firstOfCurrentMonth);
      return (latest.weight - (firstOfMonth?.weight || latest.weight)).toFixed(1);
    }
    
    return (latest.weight - previousMonthRecord.weight).toFixed(1);
  }, [data?.weight_progress]);

  const hasWeightThisMonth = data?.weight_progress?.some(log => {
    const logDate = new Date(log.date);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  });

  const attendanceStats = React.useMemo(() => {
    if (!data?.monthly_attendance) return { percentage: 0, daysAttended: 0, totalPossible: 0 };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.getDate();
    
    let totalPossible = 0;
    let daysAttended = 0;
    
    // Create a set of attended dates for easy lookup
    const attendedDates = new Set(
      data.monthly_attendance
        .filter(record => record.attended)
        .map(record => record.date)
    );
    
    // Iterate through all days of the month up to today
    for (let day = 1; day <= today; day++) {
      const date = new Date(currentYear, currentMonth, day);
      // Skip Sundays (0)
      if (date.getDay() !== 0) {
        totalPossible++;
        const dateStr = date.toISOString().split('T')[0];
        if (attendedDates.has(dateStr)) {
          daysAttended++;
        }
      }
    }
    
    const percentage = totalPossible > 0 ? Math.round((daysAttended / totalPossible) * 100) : 0;
    
    return { percentage, daysAttended, totalPossible };
  }, [data?.monthly_attendance]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Mi Dashboard</h1>
          <p className="text-zinc-500 font-medium text-sm">Seguimiento de tu progreso real</p>
        </div>
      </div>

      {!loading && !hasWeightThisMonth && !isAlertDismissed && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500 relative">
          <AlertTriangle className="h-4 w-4" />
          <button 
            onClick={handleDismissAlert}
            className="absolute right-4 top-4 text-red-500/50 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertTitle className="font-black italic uppercase tracking-tighter">Recordatorio de Peso</AlertTitle>
          <AlertDescription className="font-medium">
            No has registrado tu peso corporal este mes. Es importante mantener un seguimiento regular para ver tus avances.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full overflow-hidden">
        <MetricCard 
          title="Peso Actual" 
          value={data?.quick_metrics.current_weight ? `${data.quick_metrics.current_weight} kg` : '--'} 
          icon={Scale} 
          trend={`${weightTrend} kg`} 
          subtitle="vs. anterior" 
          color="#3b82f6" 
          loading={loading} 
        />
        <MetricCard 
          title="Asistencia" 
          value={`${attendanceStats.percentage}%`} 
          icon={CheckCircle2} 
          trend={`${attendanceStats.daysAttended}/${attendanceStats.totalPossible}`} 
          subtitle="días este mes" 
          color="#10b981" 
          loading={loading} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start w-full overflow-hidden">
        <div className="lg:col-span-2 space-y-6 w-full overflow-hidden">
          <WeightProgressChart 
            data={data?.weight_progress || []} 
            goalType={data?.weight_goal_type || 'MAINTAIN'} 
            loading={loading}
            onLogWeight={async (weight, date) => {
              await logWeight(weight, date);
              await fetchUser();
            }}
          />
          <UnifiedCalendar 
            attendance={data?.monthly_attendance || []} 
            onToggleAttendance={toggleAttendance} 
            loading={loading}
          />
        </div>
        <div className="space-y-6 w-full overflow-hidden">
          <MembershipStatus 
            membership={data?.membership || null} 
            alert={data?.membership_status_alert || false} 
            loading={loading}
            onAcquirePlan={openPlanModal}
          />
          <div className="animate-in slide-in-from-right duration-700 delay-200 w-full overflow-hidden">
            <RoutineOverview routine={data?.weekly_routine || null} loading={loading} />
          </div>
        </div>
    </div>
  );
}
