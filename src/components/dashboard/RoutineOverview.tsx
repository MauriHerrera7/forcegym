import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Calendar, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { RoutineDocument } from '@/components/training/RoutineDocument';
import { fetchApi } from '@/lib/api';

interface RoutineOverviewProps {
  routine: {
    id: string;
    name: string;
    scheduled_days: string[];
    exercises_count: number;
  } | null;
  loading?: boolean;
}

export function RoutineOverview({ routine, loading }: RoutineOverviewProps) {
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleOpenPreview = async () => {
    if (!routine?.id) return;
    
    setModalLoading(true);
    try {
      const response = await fetchApi(`/training/routines/${routine.id}/`);
      setSelectedRoutine(response);
    } catch (err) {
      console.error('Error fetching routine details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#191919] border-[#404040] animate-pulse">
        <div className="h-40" />
      </Card>
    );
  }

  if (!routine) {
    return (
      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader>
          <CardTitle className="text-white font-normal flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-red-500" />
            Mis Rutinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No tienes una rutina activa asignada actualmente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader className="pb-2">
          <CardTitle className="text-white font-normal flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-red-500" />
              Mis Rutinas
            </div>
            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">Personal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-[#303030] bg-white/5 hover:bg-white/10 transition-all duration-300 group">
            <div className="space-y-1">
               <h3 className="text-lg font-medium text-white group-hover:text-red-500 transition-colors uppercase tracking-tight italic">
                 {routine.name}
               </h3>
               <div className="flex items-center gap-4 text-sm text-gray-400">
                 <div className="flex items-center gap-1">
                   <CheckCircle2 className="h-4 w-4 text-green-500" />
                   <span className="font-medium text-white">{routine.exercises_count} ejercicios</span>
                 </div>
               </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleOpenPreview}
                  className="bg-red-600 hover:bg-red-700 text-white gap-2 transition-all shadow-lg shadow-red-600/20 px-6 font-medium italic uppercase tracking-tighter"
                >
                  <Eye className="h-4 w-4" />
                  Ver Rutina
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121212] border-[#303030] text-white scrollbar-thin scrollbar-thumb-red-600 p-0 sm:p-6">
                <DialogHeader className="p-4 pr-12 sm:p-0 text-left sm:text-left">
                  <DialogTitle className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white border-b border-[#303030] pb-2 sm:pb-4 w-full">
                    Visualizar Rutina
                  </DialogTitle>
                </DialogHeader>
                
                {modalLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                    <p className="text-gray-400 animate-pulse uppercase tracking-widest font-bold text-xs italic">Cargando detalles...</p>
                  </div>
                ) : selectedRoutine ? (
                  <div className="mt-6">
                    <RoutineDocument routine={selectedRoutine} />
                  </div>
                ) : (
                  <div className="text-center py-10 text-red-500 font-bold">
                    Error al cargar los datos de la rutina.
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
