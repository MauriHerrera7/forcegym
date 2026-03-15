'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoutineDocument } from '@/components/training/RoutineDocument';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function RoutineDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await fetchApi(`/training/routines/${id}/`);
        setRoutine(response);
      } catch (err) {
        setError('Error al cargar la rutina');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoutine();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Rutina no encontrada'}</p>
        <Link href="/client/routines">
          <Button variant="outline">Volver a mis rutinas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-0 sm:px-4 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 no-print print-hidden border-b border-[#303030] pb-6">
        <div className="flex justify-start">
          <Link href="/client/routines">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors px-0 no-print">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
        </div>
        
        <div className="text-center order-first md:order-none">
          <h1 className="text-2xl font-medium text-white uppercase tracking-tight">Visualizar Rutina</h1>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            onClick={handlePrint}
            className="bg-red-600 hover:bg-red-700 text-white gap-2 transition-all shadow-lg shadow-red-600/20"
          >
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </Button>
        </div>
      </div>

      <RoutineDocument routine={routine} />
    </div>
  );
}
