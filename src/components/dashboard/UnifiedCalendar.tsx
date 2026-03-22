'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProgressTab } from '@/components/dashboard/ProgressTab';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Info, Activity, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

function DailyProgressPreview({ date }: { date: Date | undefined }) {
  const [logs, setLogs] = useState<any[]>([]);
  
  React.useEffect(() => {
    const checkLogs = () => {
      const savedLogs = localStorage.getItem('forcegym_progress_logs');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    };
    checkLogs();
    
    window.addEventListener('storage', checkLogs);
    window.addEventListener('progress_updated', checkLogs);
    return () => {
      window.removeEventListener('storage', checkLogs);
      window.removeEventListener('progress_updated', checkLogs);
    };
  }, []);

  if (!date) return (
    <div className="bg-[#111] p-6 rounded-2xl border border-[#333] h-full flex flex-col items-center justify-center text-center text-gray-500">
      <Activity className="h-8 w-8 mb-3 opacity-20" />
      <p className="text-sm font-bold">Selecciona un día en el calendario</p>
    </div>
  );

  const dateKey = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const dailyLogs = logs.filter(log => log.date === dateKey);

  return (
    <div className="bg-[#111] p-5 rounded-2xl border border-[#333] h-full flex flex-col shadow-xl">
      <div className="flex items-center gap-2 border-b border-[#222] pb-4 mb-4">
        <Dumbbell className="h-5 w-5 text-[#ff0400]" />
        <h4 className="text-white font-black italic uppercase tracking-wider">
          Resumen: {format(date, "d 'de' MMMM", { locale: es })}
        </h4>
      </div>
      
      {dailyLogs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-4">
          <Activity className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-sm font-medium text-gray-400">Sin progreso registrado.</p>
          <p className="text-xs mt-1">Toca el día en el calendario para anotar.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 max-h-[300px] pr-2">
          {dailyLogs.map(log => (
            <div key={log.id} className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-xl flex justify-between items-center hover:border-[#ff0400]/30 transition-colors">
              <span className="text-white text-sm font-bold truncate pr-3">{log.exercise}</span>
              <div className="text-right flex-shrink-0">
                <span className="text-[#ff0400] text-sm font-black italic block">{log.weight} kg</span>
                {log.reps && <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{log.reps} reps</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface UnifiedCalendarProps {
  attendance: { date: string; attended: boolean }[];
  onToggleAttendance: (date: string, attended: boolean) => Promise<void>;
  loading?: boolean;
}

export function UnifiedCalendar({ attendance, onToggleAttendance, loading }: UnifiedCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Parse attendance into a map for fast lookup
  const attendanceMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    attendance.forEach(record => {
      map.set(record.date, record.attended);
    });
    return map;
  }, [attendance]);

  const handleDayClick = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // We only allow interacting with today or past days
    if (date > today) return;

    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const getDayStatus = (date: Date) => {
    // Keep local date string consistent with the backend format YYYY-MM-DD
    const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    return attendanceMap.get(dateStr);
  };

  const handleAttendance = async (attended: boolean) => {
    if (!selectedDate || isToggling) return;
    setIsToggling(true);
    try {
      const dateStr = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      await onToggleAttendance(dateStr, attended);
    } catch (e) {
      console.error(e);
    } finally {
      setIsToggling(false);
      // We don't close the modal automatically so they can log progress
    }
  };

  const currentStatus = selectedDate ? getDayStatus(selectedDate) : undefined;
  const isFuture = selectedDate ? selectedDate > new Date() : false;

  return (
    <>
      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#ff0400]" />
            Calendario Unificado
          </CardTitle>
          <p className="text-sm text-gray-400">Asistencias y Progresos</p>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 p-1.5 sm:p-6 sm:pt-0 pb-6 w-full items-start overflow-hidden">
          {/* Left Side: Calendar & Legend */}
          <div className="flex-1 flex flex-col items-center w-full max-w-full md:max-w-sm mx-auto md:mx-0 overflow-hidden">
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs p-3 rounded-xl w-full mb-4 flex items-start gap-3 shadow-inner">
               <Info className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5" />
               <p className="leading-relaxed"><strong>Instrucciones:</strong> Toca cualquier día en el calendario para registrar tu asistencia o marcas.</p>
            </div>
            
            <div className="w-full bg-[#111] p-1 sm:p-2 rounded-2xl border border-[#333] flex justify-center shadow-lg overflow-x-auto custom-scrollbar">
              <Calendar
                mode="single"
                selected={selectedDate}
                onDayClick={(date) => {
                   if(date) handleDayClick(date);
                }}
                locale={es}
                className="rounded-md border-0 pointer-events-auto p-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full relative",
                  month_grid: "w-full border-collapse space-y-1",
                  weekdays: "flex w-full",
                  weekday: "text-zinc-500 rounded-md w-8 h-8 sm:w-9 sm:h-9 font-normal text-[0.8rem]",
                  week: "flex w-full mt-2",
                  day: cn(
                    "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#ff0400]/20 rounded-md transition-colors"
                  ),
                }}
                modifiers={{
                  attended: (date) => getDayStatus(date) === true,
                  absent: (date) => getDayStatus(date) === false,
                  future: (date) => {
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    return date > today;
                  }
                }}
                modifiersClassNames={{
                  attended: "bg-green-500/20 text-green-500 font-bold border-b-2 border-green-500",
                  absent: "bg-red-500/10 text-red-400 border-b-2 border-red-500/50",
                  future: "opacity-30 cursor-not-allowed hover:bg-transparent"
                }}
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-[10px] text-gray-400 justify-center w-full uppercase tracking-widest font-bold">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/20 border-b-2 border-green-500 rounded-sm" />
                <span>Asistió</span>
              </div>
              <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-red-500/10 border-b-2 border-red-500/50 rounded-sm" />
                <span>No Asistió</span>
              </div>
            </div>
          </div>
          
          {/* Right Side: Progress Preview */}
          <div className="flex-1 w-full h-full sm:mt-0 mt-4 md:pt-14">
             <DailyProgressPreview date={selectedDate} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#333] text-white sm:max-w-md p-0 overflow-hidden focus:outline-none">
          <DialogHeader className="p-6 pb-4 border-b border-[#222] bg-[#1a1a1a]">
            <DialogTitle className="text-xl font-bold uppercase italic tracking-wider flex items-center justify-between text-white">
              {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'Día'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Marca tu asistencia y registra tu entrenamiento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Attendance Section */}
            {!isFuture && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-white/90 tracking-widest">Estado de Asistencia</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleAttendance(true)}
                    disabled={isToggling || loading}
                    className={cn(
                      "h-14 flex flex-col items-center justify-center gap-1 border-2 transition-all",
                      currentStatus === true 
                        ? "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30" 
                        : "bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-green-500/50"
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Asistí</span>
                  </Button>
                  <Button
                    onClick={() => handleAttendance(false)}
                    disabled={isToggling || loading}
                    className={cn(
                      "h-14 flex flex-col items-center justify-center gap-1 border-2 transition-all",
                      currentStatus === false 
                        ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30" 
                        : "bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-red-500/50"
                    )}
                  >
                    <XCircle className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">No Asistí</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Progress Section */}
            <div>
              <h4 className="text-xs font-black uppercase text-white/90 tracking-widest mb-3 border-t border-[#333] pt-6">Progreso del Día</h4>
              {selectedDate && <ProgressTab date={selectedDate} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
