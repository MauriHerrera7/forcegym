'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, History, Trash2 } from 'lucide-react';

interface ProgressLog {
  id: string;
  date: string;
  exercise: string;
  weight: number;
  reps: string;
}

function parseReps(value: string): { display: string; total: number | null } {
  const nxmMatch = value.match(/^(\d+)[xX*](\d+)$/);
  if (nxmMatch) {
    const series = parseInt(nxmMatch[1]);
    const reps = parseInt(nxmMatch[2]);
    const total = series * reps;
    return { display: `${series}x${reps} = ${total} reps`, total };
  }
  const num = parseInt(value);
  if (!isNaN(num) && num > 0) {
    return { display: `${num} reps`, total: num };
  }
  return { display: '', total: null };
}

export function ProgressTab({ date }: { date: Date }) {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [repsPreview, setRepsPreview] = useState('');
  const [mounted, setMounted] = useState(false);

  // Load logs from localStorage
  useEffect(() => {
    setMounted(true);
    const savedLogs = localStorage.getItem('forcegym_progress_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Save logs to localStorage
  useEffect(() => {
    if (mounted) {
       localStorage.setItem('forcegym_progress_logs', JSON.stringify(logs));
       window.dispatchEvent(new Event('progress_updated'));
    }
  }, [logs, mounted]);

  if (!date || !mounted) return null;

  // IMPORTANT: adjusting to local timezone string slice to avoid UTC shift
  const dateKey = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !weight) return;

    const newLog: ProgressLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateKey,
      exercise,
      weight: parseFloat(weight),
      reps,
    };

    setLogs([...logs, newLog]);
    setExercise('');
    setWeight('');
    setReps('');
    setRepsPreview('');
  };

  const removeLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  const dailyLogs = logs.filter(log => log.date === dateKey);

  return (
    <div className="space-y-6">
      {/* Log Form Card */}
      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader className="py-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-[#ff0400]" />
            Anotar Progreso - {date.toLocaleDateString('es-ES')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLog} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="exercise" className="text-gray-400 text-xs">Ejercicio</Label>
              <Input
                id="exercise"
                placeholder="Ej: Press de Banca, Sentadillas..."
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="bg-[#0A0A0A] border-[#404040] text-white focus:ring-[#ff0400] h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight" className="text-gray-400 text-xs">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="text"
                  inputMode="decimal"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                      setWeight(val);
                    }
                  }}
                  className="bg-[#0A0A0A] border-[#404040] text-white focus:ring-[#ff0400] h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reps" className="text-gray-400 text-xs">Series x Reps</Label>
                <Input
                  id="reps"
                  placeholder="3x12"
                  value={reps}
                  onChange={(e) => {
                    setReps(e.target.value);
                    setRepsPreview('');
                  }}
                  onBlur={() => {
                    if (reps) {
                      const parsed = parseReps(reps);
                      setRepsPreview(parsed.display);
                    }
                  }}
                  className="bg-[#0A0A0A] border-[#404040] text-white focus:ring-[#ff0400] h-9"
                />
                {repsPreview && <p className="text-[10px] text-green-500 mt-0.5">{repsPreview}</p>}
                <p className="text-[10px] text-zinc-500">Podés escribir NxM (ej: 3x10)</p>
              </div>
            </div>
            <Button type="submit" size="sm" className="w-full bg-[#ff0400] hover:bg-[#ff0400]/90 text-white font-bold tracking-wider">
              Guardar Progreso
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader className="py-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-[#ff0400]" />
            Registros del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500">
              <p className="text-xs">No hay registros para este día</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dailyLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#404040]">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm truncate">{log.exercise}</h4>
                    <p className="text-xs text-gray-400 w-full truncate text-ellipsis">
                      {log.weight} kg {log.reps && `• ${log.reps}`}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeLog(log.id)}
                    className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
