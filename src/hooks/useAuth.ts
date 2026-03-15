"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Cookies from "js-cookie";

interface UserProfile {
  bio?: string;
  date_of_birth?: string;
  fitness_goal?: string;
  goal_type?: 'LOSE' | 'GAIN';
  medical_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_training_days?: string[];
  notifications_enabled?: boolean;
}

export interface User {
  id: string; // Updated to string for UUID
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: string;
  role_display?: string;
  gender?: "male" | "female";
  dni: string;
  phone?: string;
  birthdate: string;
  profile_picture?: string;
  profile_picture_url?: string;
  weight?: string | number;
  height?: string | number;
  bmi?: string | number;
  is_active: boolean;
  profile?: UserProfile;
  created_at?: string;
  updated_at?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) throw new Error("No refresh token available");

      const response = await fetchApi("/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });

      if (response && response.access) {
        localStorage.setItem("access_token", response.access);
        Cookies.set("authenticated", "true", { expires: 7 });
        // If the backend rotates refresh tokens, update it
        if (response.refresh) {
          localStorage.setItem("refresh_token", response.refresh);
        }
        return response.access;
      }
      throw new Error("Could not refresh token");
    } catch (error) {
      console.error("Error al renovar el token:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      Cookies.remove("authenticated");
      Cookies.remove("auth_role");
      setUser(null);
      throw error;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Obtener el perfil del usuario actual desde el backend
      try {
        const userData = await fetchApi("/users/me/");
        setUser(userData);
      } catch (error: unknown) {
        const err = error as { status?: number };
        // Si el error es 401, intentar refrescar el token
        if (err && err.status === 401) {
          console.warn("Token de acceso expirado, intentando renovar...");
          try {
            const newToken = await refreshToken();
            if (newToken) {
              // Reintentar obtener el usuario con el nuevo token
              const userData = await fetchApi("/users/me/");
              setUser(userData);
              return;
            }
          } catch (refreshError) {
            console.error(
              "Error definitivo tras intento de refresh:",
              refreshError,
            );
          }
        }

        // Si llegamos aquí es que falló todo o no era un 401 recuperable
        if (err && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          Cookies.remove("authenticated");
          Cookies.remove("auth_role");
          setUser(null);
        }

        console.error("Error al cargar el usuario:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  // Cargar usuario al iniciar
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        const response = await fetchApi("/auth/login/", {
          method: "POST",
          body: JSON.stringify(credentials),
        });

        if (response && response.access) {
          localStorage.setItem("access_token", response.access);
          if (response.refresh) {
            localStorage.setItem("refresh_token", response.refresh);
          }

          // El token ya está en localStorage, fetchApi lo recogerá automáticamente
          // Obtener la info del usuario ahora que estamos autenticados
          const userData = await fetchApi("/users/me/");
          setUser(userData);
          setLoading(false);

          // Sincronizar cookies para el middleware
          const userRole = userData.role?.toUpperCase();
          Cookies.set("authenticated", "true", { expires: 7 });
          Cookies.set("auth_role", userRole, { expires: 7 });

          // Redirigir al dashboard correspondiente según el rol (URL masking handles this now)
          /*
          if (userRole === 'ADMIN') {
            router.push("/admin");
          } else {
            router.push("/client");
          }
          */
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
      }
    },
    [router],
  );

  const register = useCallback(async (userData: Record<string, unknown> | FormData) => {
    try {
      // Determine if we should send as FormData (for file uploads)
      const body =
        userData instanceof FormData ? userData : JSON.stringify(userData);

      const response = await fetchApi("/users/register/", {
        method: "POST",
        body: body,
      });

      return response;
    } catch (error) {
      console.error("Error en el registro:", error);
      throw error;
    }
  }, []); // Remove 'login' dependency as it's not used here

  const updateProfile = useCallback(async (data: Record<string, unknown> | FormData) => {
    try {
      const body = data instanceof FormData ? data : JSON.stringify(data);

      const response = await fetchApi("/users/update_profile/", {
        method: "PATCH",
        body: body,
      });
      setUser(response);
      return response;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("forcegym_app_view");
      localStorage.removeItem("forcegym_dashboard_view");
      Cookies.remove("authenticated");
      Cookies.remove("auth_role");
      Cookies.remove("forcegym_app_view");
      Cookies.remove("forcegym_dashboard_view");
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  }, [router]);

  const deleteAccount = useCallback(async () => {
    try {
      // Esto requeriría un endpoint específico en el backend si deseamos borrarlo
      // await fetchApi(`/users/${user?.id}/`, { method: 'DELETE' })
      await logout();
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      throw error;
    }
  }, [logout]);

  return {
    user,
    loading,
    login,
    register,
    updateProfile,
    logout,
    deleteAccount,
    fetchUser,
    isAuthenticated: !!user,
  };
}
