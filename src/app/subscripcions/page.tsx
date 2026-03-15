"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [billing, setBilling] = useState("monthly");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await fetchApi("/memberships/plans/");
        // El backend devuelve una lista o { results: [] } según la configuración de paginación
        const plansData = Array.isArray(data) ? data : (data.results || []);
        setPlans(plansData.filter((p: any) => p.is_active));
      } catch (err: any) {
        console.error("Error loading plans:", err);
        setError("No se pudieron cargar los planes. Por favor, intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handlePurchase = async (planId: string) => {
    // Verificar si el usuario está autenticado
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push('/auth/login?redirect=/subscripcions');
      return;
    }

    setPurchasing(planId);
    try {
      const response = await fetchApi("/payments/create_with_membership/", {
        method: "POST",
        body: JSON.stringify({ plan_id: planId }),
      });

      if (response && response.init_point) {
        window.location.href = response.init_point;
      }
    } catch (err: any) {
      console.error("Error creating purchase:", err);
      toast.error(err.message || "Error al procesar la suscripción.");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 pt-32 pb-12">
      <section className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Planes de suscripción
            </h1>
            <p className="text-red-500 mt-2 font-medium">
              Elegí el plan que mejor se adapte a tu ritmo.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Billing toggle */}
            <div className="bg-gray-900 rounded-full p-1 flex items-center border border-red-600">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                  billing === "monthly"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-400"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                  billing === "yearly"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-400"
                }`}
              >
                Anual
              </button>
            </div>
          </div>
        </header>

        {/* PLANES */}
        {loading ? (
          <div className="flex h-64 items-center justify-center w-full">
            <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-900/50 rounded-2xl border border-red-900/30 text-center w-full">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-zinc-400">{error}</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-900/50 rounded-2xl border border-red-900/30 text-center w-full">
            <p className="text-zinc-400 italic">No hay planes disponibles en este momento. Vuelve pronto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, idx) => (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative bg-gradient-to-b from-gray-900 to-black border border-red-600 rounded-2xl p-6 shadow-lg flex flex-col"
              >
                {/* Badge based on duration */}
                {plan.duration_days >= 365 && (
                  <div className="absolute -top-3 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                    Mejor ahorro
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-2xl font-extrabold text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-300 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-white">
                    ${Math.floor(parseFloat(plan.price)).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400">
                    / {plan.duration_days} días
                  </span>
                </div>

                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features && plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={16} className="text-red-500 mt-1 shadow-red-500/20" />
                      <span className="text-sm text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id}
                  className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchasing === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Suscribirme"
                  )}
                </button>

                <p className="mt-3 text-xs text-gray-500 text-center font-medium">
                  Pago seguro via Mercado Pago
                </p>
              </motion.article>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-16 bg-gray-900 border border-red-600 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-bold text-lg text-white">¿Necesitás ayuda?</h4>
            <p className="text-gray-400 text-sm">
              Chateá con nuestro equipo
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg border border-red-600 text-sm font-medium text-white hover:bg-red-600 hover:text-white transition"
            >
              Chatear
            </Link>
            
          </div>
        </footer>

        <p className="mt-8 text-center text-xs text-gray-500">
          Precios en pesos argentinos. Impuestos no incluidos.
        </p>
      </section>
    </main>
  );
}