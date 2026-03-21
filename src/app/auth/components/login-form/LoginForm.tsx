'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import { useAppNavigation } from '@/providers/AppNavigationProvider';
import { fetchApi } from '@/lib/api';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  className?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginForm({ className = '' }: LoginFormProps) {
  const { login } = useAuthContext();
  const { navigateTo } = useAppNavigation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Introduce un correo válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      
      // Fetch user role to navigate correctly since automatic redirect is disabled
      const userRes = await fetchApi("/users/me/");
      if (userRes?.role?.toUpperCase() === 'ADMIN') {
        navigateTo('admin');
      } else {
        navigateTo('client');
      }
    } catch (error: any) {
      console.error('Login error detail:', JSON.stringify(error, null, 2));
      console.error('Login error message:', error.message);

      const detail = error?.data?.detail || error?.message || '';
      const detailLower = detail.toLowerCase();

      if (
        detailLower.includes('password') ||
        detailLower.includes('contraseña') ||
        detailLower.includes('credentials') ||
        detailLower.includes('credenciales') ||
        detailLower.includes('incorrect')
      ) {
        setErrors({
          password: 'Contraseña incorrecta. Verifica e intenta de nuevo.',
        });
      } else if (
        detailLower.includes('no active') ||
        detailLower.includes('not found') ||
        detailLower.includes('email') ||
        detailLower.includes('correo') ||
        detailLower.includes('user')
      ) {
        setErrors({
          email: 'No existe una cuenta con ese correo.',
        });
      } else {
        setErrors({
          password: 'Correo o contraseña incorrectos. Revisa tus datos.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto px-6 ${className}`}>
      <button
        type="button"
        onClick={() => navigateTo('landing')}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 text-sm font-medium bg-transparent border-none p-0 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a inicio
      </button>

      <div className="mb-10 text-left">
        <h1 className="text-[40px] font-semibold tracking-tight text-white leading-tight mb-2">
          Bienvenido a <br />Force Gym.
        </h1>
        <p className="text-zinc-500 text-lg font-medium">
          Ingresa tus credenciales.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-[12px] font-semibold text-zinc-200 uppercase tracking-widest ml-1"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              className={`w-full bg-[#1c1c1e] text-white px-4 py-4 rounded-xl border transition-all duration-300 outline-none
                ${errors.email 
                  ? 'border-red-500/50 focus:border-red-500' 
                  : 'border-zinc-800 focus:border-white'
                }`}
              placeholder="nombre@ejemplo.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <label 
                htmlFor="password" 
                className="text-[12px] font-semibold text-zinc-200 uppercase tracking-widest"
              >
                Contraseña
              </label>
              <button 
                type="button"
                onClick={() => navigateTo('landing')}
                className="text-xs text-apple-orange hover:text-apple-orange/80 transition-colors outline-none bg-transparent border-none p-0 cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                className={`w-full bg-[#1c1c1e] text-white px-4 py-4 rounded-xl border transition-all duration-300 outline-none
                  ${errors.password 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : 'border-zinc-800 focus:border-white'
                  }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
                {errors.password}
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 space-y-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:!bg-red-700 hover:!text-white py-4 rounded-full text-lg font-bold transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <p className="text-center text-zinc-500 font-medium">
            ¿No tienes cuenta?{' '}
            <button 
              type="button"
              onClick={() => navigateTo('register')} 
              className="text-white hover:text-apple-orange transition-colors outline-none bg-transparent border-none p-0 cursor-pointer font-bold"
            >
              Crea una ahora.
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
