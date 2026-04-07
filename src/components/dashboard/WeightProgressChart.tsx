'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Calculator, 
  Loader2, 
  Save 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis 
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  weight: {
    label: "Peso (kg)",
    color: "#ff0400",
  },
} satisfies ChartConfig

interface WeightProgressChartProps {
  data: { date: string; weight: number }[];
  goalType: 'LOSE' | 'GAIN' | 'MAINTAIN';
  onLogWeight?: (weight: number, date: string) => Promise<void>;
  loading?: boolean;
}

export function WeightProgressChart({ data, goalType, onLogWeight, loading }: WeightProgressChartProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepare data for the full year (Jan to Dec) with continuity
  const chartData = useMemo(() => {
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Group logs by month
    const monthlyLogs: Record<number, number[]> = {};
    data.forEach(log => {
      const d = new Date(log.date);
      if (d.getFullYear() === currentYear) {
        const month = d.getMonth();
        if (!monthlyLogs[month]) monthlyLogs[month] = [];
        monthlyLogs[month].push(log.weight);
      }
    });

    // Find first and last available weight to fill gaps
    let firstWeight: number | null = null;
    let lastWeight: number | null = null;
    
    const tempMonthlyWeights: (number | null)[] = months.map((_, index) => {
      const logs = monthlyLogs[index];
      if (logs && logs.length > 0) {
        const w = logs[logs.length - 1];
        if (firstWeight === null) firstWeight = w;
        lastWeight = w;
        return w;
      }
      return null;
    });

    // Fill gaps: Carry Forward for past/present, stop for future
    let currentWeight: number | null = firstWeight;
    
    return months.map((monthName, index) => {
      const recordedWeight = tempMonthlyWeights[index];
      const isFuture = index > now.getMonth();
      
      // If we have a recorded weight, update our current running weight
      if (recordedWeight !== null) {
        currentWeight = recordedWeight;
      }
      
      // Logic: 
      // 1. If recorded, always use it.
      // 2. If not recorded and NOT future, use currentWeight (Carry Forward/Backward).
      // 3. If not recorded and IS future, use null (stop the line).
      const finalWeight = recordedWeight !== null 
        ? recordedWeight 
        : isFuture 
          ? null 
          : currentWeight;

      return {
        month: monthName,
        weight: finalWeight,
        isInterpolated: recordedWeight === null && finalWeight !== null,
        fullDate: `${monthName} ${currentYear}`
      };
    });
  }, [data]);

  // Calculate monthly difference
  const getMonthlyDifference = () => {
    if (!data || data.length < 2) return null;
    
    // Sort all available data points
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    
    // Find the first day of the current month (relative to latest reading)
    const latestDate = new Date(latest.date);
    const firstOfCurrentMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    
    // Find the last record from any PREVIOUS month
    const previousMonthRecord = sorted
      .filter(log => new Date(log.date) < firstOfCurrentMonth)
      .pop();
      
    if (!previousMonthRecord) {
      // Fallback: If it's the very first month with data, compare against first log of month
      const firstOfMonth = sorted.find(log => new Date(log.date) >= firstOfCurrentMonth);
      return firstOfMonth ? latest.weight - firstOfMonth.weight : 0;
    }
    
    return latest.weight - previousMonthRecord.weight;
  };

  const monthlyDiff = getMonthlyDifference();

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !onLogWeight) return;
    
    // Only allow today
    const today = new Date().toISOString().split('T')[0];
    
    if (newDate !== today) {
      alert("Solo podés registrar el peso del día de hoy.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onLogWeight(parseFloat(newWeight), today);
      setIsModalOpen(false);
      setNewWeight('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#191919] border-[#404040] animate-pulse">
        <div className="h-64" />
      </Card>
    );
  }

  function renderRegisterButton() {
    return (
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-[#111] hover:bg-[#222] border border-[#333] text-white text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg flex items-center gap-2"
      >
        <Plus className="h-3 w-3 text-[#ff0400]" />
        Registrar Peso
      </Button>
    );
  }

  function renderModal() {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111] border-[#333] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-white">Registrar Peso Corporal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogWeight} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fecha</Label>
                <div className="bg-[#0a0a0a] border border-[#333] text-white h-12 flex items-center px-4 rounded-md text-sm font-medium">
                  {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Peso (kg)</Label>
                <Input 
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 75.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="bg-[#0a0a0a] border-[#333] text-white focus:border-[#ff0400] h-12 text-lg font-black"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#ff0400] hover:bg-red-700 text-white font-black uppercase tracking-widest h-12"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Guardar Registro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="bg-[#191919] border-[#404040]">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-white font-normal uppercase italic tracking-tighter">Progreso de Peso</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest whitespace-nowrap">
              Objetivo: <span className="text-zinc-300">{goalType === 'LOSE' ? 'Bajar' : goalType === 'GAIN' ? 'Subir' : 'Mantener'}</span>
            </p>
            {monthlyDiff !== null && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap",
                monthlyDiff < 0 ? "bg-green-500/10 text-green-500" : monthlyDiff > 0 ? "bg-blue-500/10 text-blue-500" : "bg-zinc-500/10 text-zinc-500"
              )}>
                {monthlyDiff < 0 ? <TrendingDown className="h-3 w-3" /> : monthlyDiff > 0 ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                Este mes: {monthlyDiff > 0 ? '+' : ''}{monthlyDiff.toFixed(1)} kg
              </div>
            )}
          </div>
        </div>
        <div className="w-full sm:w-auto">
          {renderRegisterButton()}
        </div>
      </CardHeader>
      <CardContent className="h-[250px] w-full mt-2">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-zinc-500 text-sm text-center">
              No has registrado tu peso aún.{' '}
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[#ff0400] font-bold hover:underline cursor-pointer bg-transparent border-none p-0 inline"
              >
                Registrar peso acá →
              </button>
            </p>
          </div>
        ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 15,
            }}
          >
            <defs>
              <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#404040" opacity={0.3} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              interval={0}
              tick={{ fontSize: 9, fill: '#a1a1aa', fontWeight: 500 }}
            />
            <YAxis
              hide
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <ChartTooltip
              cursor={{ stroke: '#404040', strokeWidth: 1 }}
              content={
                <ChartTooltipContent 
                  hideLabel 
                  labelKey="fullDate" 
                  formatter={(value) => value ? `${value} kg` : 'Sin registro'}
                />
              }
            />
            <Area
              dataKey="weight"
              type="monotone"
              connectNulls
              fill="url(#fillWeight)"
              fillOpacity={0.2}
              stroke="var(--color-weight)"
              strokeWidth={3}
              activeDot={{
                r: 4,
                fill: "var(--color-weight)",
                stroke: "#191919",
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
      {renderModal()}
    </Card>
  );
}
