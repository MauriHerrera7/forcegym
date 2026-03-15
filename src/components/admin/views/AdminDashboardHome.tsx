'use client';

import { useState, useEffect } from 'react';
import { useAdmin, AdminUser } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardHome() {
  const { getGymMetrics, getRecentUsers, getMetricsHistory, loading } = useAdmin();
  const [metricsData, setMetricsData] = useState<any>(null);
  const [recentUsersData, setRecentUsersData] = useState<AdminUser[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [metrics, users, history] = await Promise.all([
        getGymMetrics(),
        getRecentUsers(),
        getMetricsHistory(30)
      ]);
      setMetricsData(metrics);
      setRecentUsersData(users);
      const sortedHistory = [...(history || [])].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setHistoryData(sortedHistory);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const metrics = [
    { 
      title: 'Total Usuarios', 
      value: metricsData?.total_users?.toString() || '0', 
      icon: Users, 
      trend: `+${metricsData?.new_members || 0} nuevos`,
      color: 'text-blue-500'
    },
    { 
      title: 'Ventas del Mes', 
      value: `$${parseFloat(metricsData?.total_revenue || '0').toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      trend: 'Ingresos totales',
      color: 'text-emerald-500'
    },
    { 
      title: 'Miembros Activos', 
      value: metricsData?.active_memberships?.toString() || '0', 
      icon: TrendingUp, 
      trend: `${metricsData?.active_members || 0} membresías vigentes`,
      color: 'text-orange-500'
    },
    { 
      title: 'Check-ins Hoy', 
      value: metricsData?.today_checkins?.toString() || '0', 
      icon: Activity, 
      trend: 'Accesos registrados hoy',
      color: 'text-purple-500'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            Dashboard Admin
            {isRefreshing && <Loader2 className="h-6 w-6 animate-spin text-[#ff0400]" />}
          </h1>
          <p className="text-zinc-500 font-medium text-sm md:text-base">Control y estadísticas globales en tiempo real</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="bg-[#191919] border-[#404040] overflow-hidden group hover:border-[#ff0400]/50 transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-[#ff0400] opacity-80 group-hover:opacity-100 transition-opacity">{metric.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${metric.color || 'text-zinc-500'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-white mb-1 italic tracking-tighter">{metric.value}</div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{metric.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         <Card className="bg-[#191919] border-[#404040] lg:col-span-2 overflow-hidden">
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-white text-lg font-bold italic uppercase tracking-tight">Ingresos Recientes</CardTitle>
             <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px]">ULT. 30 DÍAS</Badge>
           </CardHeader>
           <CardContent>
              {historyData.length > 0 ? (
                <div className="h-64 flex items-end justify-between gap-1 mt-4">
                  {historyData.slice(-14).map((day, i) => (
                    <div key={i} className="flex-1 group relative flex flex-col items-center">
                      <div 
                        className="w-full bg-[#ff0400]/20 group-hover:bg-[#ff0400]/40 transition-all rounded-t-lg relative"
                        style={{ height: `${Math.max(10, (day.revenue / Math.max(...historyData.map(d => d.revenue || 1))) * 100)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#ff0400] px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          ${day.revenue}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-[#333] mt-2"></div>
                      <span className="text-[8px] text-zinc-600 mt-2 font-black uppercase rotate-45 origin-left">{new Date(day.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#333] rounded-3xl space-y-4">
                  <Activity className="h-10 w-10 text-zinc-800 animate-pulse" />
                  <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">Esperando datos de transacciones...</p>
                </div>
              )}
           </CardContent>
         </Card>

         <Card className="bg-[#191919] border-[#404040]">
           <CardHeader><CardTitle className="text-white text-lg font-bold italic uppercase tracking-tight">Estado de Membresías</CardTitle></CardHeader>
           <CardContent>
              <div className="flex flex-col items-center justify-center p-4 py-8 space-y-8">
                 <div className="relative w-40 h-40">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle
                       cx="80" cy="80" r="70"
                       stroke="currentColor" strokeWidth="12" fill="transparent"
                       className="text-zinc-800"
                     />
                     <circle
                       cx="80" cy="80" r="70"
                       stroke="currentColor" strokeWidth="12" fill="transparent"
                       strokeDasharray={440}
                       strokeDashoffset={440 - (440 * (metricsData?.total_users > 0 ? (metricsData.active_memberships / metricsData.total_users) : 0))}
                       strokeLinecap="round"
                       className="text-[#ff0400] transition-all duration-1000"
                     />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white italic tracking-tighter">
                        {metricsData?.total_users > 0 ? Math.round((metricsData.active_memberships / metricsData.total_users) * 100) : 0}%
                      </span>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Activos</span>
                   </div>
                 </div>
                 
                 <div className="w-full space-y-4">
                    <div className="flex justify-between items-end border-b border-[#333] pb-2">
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Socios Registrados</p>
                       <p className="text-white font-black italic">{metricsData?.total_users || 0}</p>
                    </div>
                    <div className="flex justify-between items-end border-b border-[#333] pb-2">
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Membresías Activas</p>
                       <p className="text-[#ff0400] font-black italic">{metricsData?.active_memberships || 0}</p>
                    </div>
                 </div>
              </div>
           </CardContent>
         </Card>
      </div>

      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg font-bold italic uppercase tracking-tight">Usuarios Registrados Recientemente</CardTitle>
          <Badge variant="outline" className="border-zinc-700 text-zinc-500 font-bold">TOP 5</Badge>
        </CardHeader>
        <CardContent>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {recentUsersData.length > 0 ? (
                recentUsersData.slice(0, 5).map((user, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl bg-black/40 border border-[#333] hover:border-[#ff0400]/30 transition-all group">
                     <Avatar className="h-16 w-16 border-2 border-[#333] group-hover:border-[#ff0400] transition-colors mb-4">
                       <AvatarImage src={user.profile_picture_url || user.profile_picture} />
                       <AvatarFallback className="bg-zinc-800 text-zinc-400 font-black text-xl">
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                       </AvatarFallback>
                     </Avatar>
                     <div className="space-y-1 w-full overflow-hidden">
                       <p className="font-black text-white italic uppercase tracking-tight text-sm truncate">{user.full_name || user.username}</p>
                       <p className="text-[10px] text-zinc-600 truncate mb-3">{user.email}</p>
                       <Badge variant="outline" className={`
                        uppercase text-[8px] font-black tracking-widest border-none px-2 py-0.5
                        ${user.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                       `}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                       </Badge>
                     </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center">
                  <p className="text-zinc-600 font-black uppercase tracking-widest text-xs italic">No hay registros recientes</p>
                </div>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
