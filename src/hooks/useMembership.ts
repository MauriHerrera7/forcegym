"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: string;
  features: string[];
  is_active: boolean;
}

export interface Membership {
  id: string;
  plan: MembershipPlan;
  start_date: string;
  end_date: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
  qr_code?: string;
  qr_code_payload?: string;
  auto_renew: boolean;
  created_at: string;
}

export interface CheckIn {
  id: string;
  checked_in_at: string;
  notes?: string;
}

export function useMembership() {
  const [activeMembership, setActiveMembership] = useState<Membership | null>(
    null,
  );
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  const fetchMembershipData = useCallback(async () => {
    // SSR guard: localStorage is not available on the server
    if (typeof window === "undefined") return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch active membership
      try {
        const membership = await fetchApi("/memberships/active/");
        setActiveMembership(membership);
        setError(null);
      } catch (err: any) {
        console.error(
          `[useMembership] /memberships/active/ → status=${err?.status}`,
          err
        );

        if (err?.status === 401) {
          // Token expired — clear stale credentials
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setError({ status: 401, message: "Sesión expirada. Por favor, iniciá sesión nuevamente." });
        } else if (err?.status !== 404) {
          // 404 means no active membership — that's a valid state, not an error
          setError({ status: err?.status ?? 500, message: err?.message ?? "Error al cargar la membresía." });
        }
        setActiveMembership(null);
      }

      // Fetch check-ins
      try {
        const checkinsData = await fetchApi("/memberships/checkins/");
        setCheckIns(checkinsData.results || checkinsData); // Handle DRF pagination if present
      } catch (err: any) {
        console.error(
          `[useMembership] /memberships/checkins/ → status=${err?.status}`,
          err
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembershipData();
  }, [fetchMembershipData]);

  return {
    activeMembership,
    checkIns,
    loading,
    error,
    refreshMembership: fetchMembershipData,
  };
}
