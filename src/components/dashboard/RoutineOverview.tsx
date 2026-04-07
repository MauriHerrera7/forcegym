import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Calendar, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 font-medium uppercase tracking-wider">Personal</span>
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

            <Link href={`/client/routines/${routine.id}`}>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white gap-2 transition-all shadow-lg shadow-red-600/20 px-6 font-medium italic uppercase tracking-tighter"
              >
                <Eye className="h-4 w-4" />
                Ver Rutina
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
