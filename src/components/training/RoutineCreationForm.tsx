'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Plus, Dumbbell, Clock, Settings2, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { ExerciseSelector } from './ExerciseSelector';
import { fetchApi } from '@/lib/api';

interface SelectedExercise {
  id: string;
  name: string;
  exercise_id: string;
  order: number;
  sets: number;
  reps: number | null;
  duration_seconds: number | null;
  rest_seconds: number;
  notes: string;
  day_of_week: number;
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function RoutineCreationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'BEGINNER',
    estimated_duration_minutes: 60,
    rest_between_sets_seconds: 60,
  });
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const handleClearSelection = () => {
    setSelectedExercises([]);
  };

  const handleExerciseSelect = (exercise: any) => {
    // Determine if the exercise is already added *for the current active day*
    const existingIndex = selectedExercises.findIndex(e => e.exercise_id === exercise.id && e.day_of_week === activeDay);
    
    if (existingIndex >= 0) {
      // Remove it from the current day
      setSelectedExercises(selectedExercises.filter((_, idx) => idx !== existingIndex));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        {
          id: Math.random().toString(36).substr(2, 9),
          exercise_id: exercise.id,
          name: exercise.name,
          order: selectedExercises.filter(e => e.day_of_week === activeDay).length,
          sets: 3,
          reps: 12,
          duration_seconds: null,
          rest_seconds: 60,
          notes: '',
          day_of_week: activeDay
        }
      ]);
    }
  };

  const updateExercise = (id: string, updates: Partial<SelectedExercise>) => {
    setSelectedExercises(selectedExercises.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (!formData.name.trim()) {
      alert('Por favor, ingresa el nombre de la rutina');
      return;
    }

    if (!formData.description.trim()) {
      alert('Por favor, ingresa una descripción para la rutina');
      return;
    }

    if (selectedExercises.length === 0) {
      alert('Debes agregar al menos un ejercicio a la rutina');
      return;
    }

    const uniqueDays = new Set(selectedExercises.map(e => e.day_of_week)).size;
    if (uniqueDays < 3) {
      alert('La rutina debe tener ejercicios asignados a por lo menos 3 días distintos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        is_active: true,
        is_template: false,
        exercises: selectedExercises.map((e, index) => ({
          exercise_id: e.exercise_id,
          order: index,
          sets: e.sets,
          reps: e.reps,
          duration_seconds: e.duration_seconds,
          rest_seconds: e.rest_seconds,
          notes: e.notes,
          day_of_week: e.day_of_week
        }))
      };

      await fetchApi('/training/routines/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      router.push('/client/routines');
    } catch (err) {
      console.error('Error creating routine', err);
      alert('Error al crear la rutina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      {/* Left Column: General Info */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-[#191919] border-[#404040]">
          <CardHeader>
            <CardTitle className="text-white font-medium uppercase text-lg">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-200">
                Nombre de la Rutina <span className="text-red-500">*</span>
              </label>
              <Input 
                required
                placeholder="Ej: Empuje - Hipertrofia"
                className="bg-[#101010] border-[#303030] text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-200">
                Descripción <span className="text-red-500">*</span>
              </label>
              <Textarea 
                placeholder="Describe el objetivo de esta rutina..."
                className="bg-[#101010] border-[#303030] text-white h-24 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-200">Duración Estimada (min)</label>
                <Input 
                  type="number"
                  className="bg-[#101010] border-[#303030] text-white"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => setFormData({...formData, estimated_duration_minutes: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#303030]">
              <Button 
                type="button" 
                className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 font-bold py-6 group"
                onClick={() => setIsSelectorOpen(true)}
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Agregar Ejercicios al {DAYS_OF_WEEK[activeDay]}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal Seleccionador */}
        <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
          <DialogContent className="max-w-4xl bg-[#1a1a1a] border-[#303030] text-white p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-medium uppercase tracking-tight text-white flex items-center gap-3">
                <Dumbbell className="h-6 w-6 text-red-600" />
                Catálogo de Ejercicios
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6 pt-2">
              <ExerciseSelector 
                onSelect={handleExerciseSelect}
                selectedIds={selectedExercises.filter(e => e.day_of_week === activeDay).map(e => e.exercise_id)}
              />
            </div>

            <DialogFooter className="bg-[#101010] p-6 flex flex-row items-center justify-between border-t border-[#303030] sm:justify-between">
              <Button 
                type="button" 
                variant="ghost" 
                className="text-gray-500 hover:text-white hover:bg-white/5 gap-2"
                onClick={() => setSelectedExercises(selectedExercises.filter(e => e.day_of_week !== activeDay))}
              >
                <X className="h-4 w-4" />
                Limpiar {DAYS_OF_WEEK[activeDay]}
              </Button>
              <Button 
                type="button" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 font-bold"
                onClick={() => setIsSelectorOpen(false)}
              >
                Confirmar ({selectedExercises.filter(e => e.day_of_week === activeDay).length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Right Column: Exercise Configuration */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-[#191919] border-[#404040] min-h-[600px]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#303030] pb-4">
            <div>
              <CardTitle className="text-white font-medium uppercase text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-red-500" />
                Plan de Entrenamiento
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">{selectedExercises.length} ejercicios seleccionados</p>
            </div>
            <div className="flex gap-2">
               <Button type="button" variant="ghost" onClick={() => router.back()} className="text-gray-400">Cancelar</Button>
               <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                 {loading ? 'Guardando...' : 'Guardar Rutina'}
                 {!loading && <Save className="ml-2 h-4 w-4" />}
               </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Day Selector Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#303030] scrollbar-track-transparent">
              {DAYS_OF_WEEK.map((day, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant={activeDay === idx ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveDay(idx)}
                  className={`flex-shrink-0 transition-colors ${
                    activeDay === idx 
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                      : 'bg-transparent border-[#303030] text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {day}
                  {selectedExercises.filter(e => e.day_of_week === idx).length > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeDay === idx ? 'bg-white/20' : 'bg-[#303030] text-gray-300'
                    }`}>
                      {selectedExercises.filter(e => e.day_of_week === idx).length}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {selectedExercises.filter(e => e.day_of_week === activeDay).map((exercise, index) => (
              <div 
                key={exercise.id}
                className="p-4 bg-[#101010] border border-[#303030] rounded-xl space-y-4 group animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <h4 className="text-white font-medium">{exercise.name}</h4>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeExercise(exercise.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-300 font-medium">Series</label>
                    <Input 
                      type="number"
                      className="h-8 bg-[#191919] border-[#404040] text-white text-sm"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(exercise.id, { sets: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-300 font-medium">Reps</label>
                    <Input 
                      type="number"
                      placeholder="12"
                      className="h-8 bg-[#191919] border-[#404040] text-white text-sm"
                      value={exercise.reps || ''}
                      onChange={(e) => updateExercise(exercise.id, { reps: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-300 font-medium">Descanso (s)</label>
                    <Input 
                      type="number"
                      className="h-8 bg-[#191919] border-[#404040] text-white text-sm"
                      value={exercise.rest_seconds}
                      onChange={(e) => updateExercise(exercise.id, { rest_seconds: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-300 font-medium">Duración (s)</label>
                    <Input 
                      type="number"
                      placeholder="Opcional"
                      className="h-8 bg-[#191919] border-[#404040] text-white text-sm"
                      value={exercise.duration_seconds || ''}
                      onChange={(e) => updateExercise(exercise.id, { duration_seconds: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                </div>
                
                <Input 
                  placeholder="Notas adicionales para este ejercicio..."
                  className="h-8 bg-[#191919] border-[#404040] text-white text-xs"
                  value={exercise.notes}
                  onChange={(e) => updateExercise(exercise.id, { notes: e.target.value })}
                />
              </div>
            ))}

            {selectedExercises.filter(e => e.day_of_week === activeDay).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-20 text-gray-600">
                <Settings2 className="h-12 w-12 mb-4 opacity-20" />
                <p>Selecciona ejercicios para el {DAYS_OF_WEEK[activeDay]}</p>
                <Button 
                  type="button"
                  variant="outline" 
                  className="mt-4 border-[#303030] text-gray-400 hover:text-white"
                  onClick={() => setIsSelectorOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ejercicios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
