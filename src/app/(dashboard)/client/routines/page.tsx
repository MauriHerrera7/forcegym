'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Dumbbell, Calendar, Clock, ChevronRight, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { fetchApi } from '@/lib/api';

interface Routine {
  id: string;
  name: string;
  difficulty: string;
  difficulty_display: string;
  estimated_duration_minutes: number;
  total_exercises: number;
  is_template: boolean;
  is_active: boolean;
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetchApi('/training/routines/');
        // Handle paginated (DRF) or plain array responses
        setRoutines(Array.isArray(response) ? response : response.results || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las rutinas');
        console.error('Fetch routines failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, routineId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRoutineToDelete(routineId);
  };

  const confirmDelete = async () => {
    if (!routineToDelete) return;
    
    try {
      await fetchApi(`/training/routines/${routineToDelete}/`, {
        method: 'DELETE',
      });
      setRoutines(routines.filter(r => r.id !== routineToDelete));
    } catch (err: any) {
      setError("Error al eliminar la rutina");
      console.error(err);
    } finally {
      setRoutineToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-b border-[#303030] pb-6">
        <div className="flex justify-start invisible md:visible">
          <div className="w-32"></div>
        </div>
        
        <div className="text-center order-first md:order-none">
          <h1 className="text-3xl font-medium text-white uppercase tracking-tight">Mis Rutinas</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider italic">Gestiona tus planes de entrenamiento</p>
        </div>

        <div className="flex justify-end">
          <Link href="/client/routines/create">
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 font-medium px-6 uppercase text-xs tracking-wider">
              <Plus className="h-4 w-4" />
              Nueva Rutina
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <Link key={routine.id} href={`/client/routines/${routine.id}`}>
            <Card className="bg-[#191919] border-[#404040] hover:border-red-500/50 transition-all group overflow-hidden">
               <CardHeader className="pb-2">
                 <div className="flex justify-between items-start">
                   <div className="flex flex-col gap-1">
                     <CardTitle className="text-xl text-white font-medium group-hover:text-red-500 transition-colors">
                       {routine.name}
                     </CardTitle>
                     {routine.is_template && (
                       <span className="w-fit text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-medium uppercase">
                         Plantilla
                       </span>
                     )}
                   </div>
                   <Button
                     type="button"
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10 -mt-1 -mr-1 z-10"
                     onClick={(e) => handleDeleteClick(e, routine.id)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                     <Dumbbell className="h-4 w-4 text-red-500" />
                     <span>{routine.total_exercises} Ejercicios</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                     <Clock className="h-4 w-4 text-blue-500" />
                     <span>{routine.estimated_duration_minutes} min</span>
                   </div>
                 </div>

                 <div className="flex items-center justify-end pt-4 border-t border-[#404040]">
                   <div className="flex items-center gap-1 text-gray-500 group-hover:text-white transition-colors text-sm font-medium">
                     Ver Detalle
                     <ChevronRight className="h-4 w-4" />
                   </div>
                 </div>
               </CardContent>
            </Card>
          </Link>
        ))}

        {routines.length === 0 && !loading && (
          <Card className="bg-[#191919] border-[#404040] border-dashed col-span-full p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-gray-800/30 rounded-full">
              <Plus className="h-12 w-12 text-gray-600" />
            </div>
            <div>
              <p className="text-white font-medium text-lg">No tienes rutinas aún</p>
              <p className="text-gray-500">Comienza creando tu primer plan de entrenamiento personalizado.</p>
            </div>
            <Link href="/client/routines/create">
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-medium">
                Crear mi primera rutina
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!routineToDelete} onOpenChange={(open) => !open && setRoutineToDelete(null)}>
        <DialogContent className="bg-[#1a1a1a] border-[#303030] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Eliminar Rutina
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              ¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer y se perderán todos los ejercicios asignados a ella.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-row justify-end gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setRoutineToDelete(null)} className="text-gray-300 hover:bg-white/10 hover:text-white">
              Cancelar
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-medium">
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
