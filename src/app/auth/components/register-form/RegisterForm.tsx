'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/providers/AuthProvider';
import { useAppNavigation } from '@/providers/AppNavigationProvider';
import { useRouter } from 'next/navigation';
import { Camera, Plus, User, Upload, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface RegisterFormProps {
  className?: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  phone: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  weight: string;
  height: string;
  gender: 'MALE' | 'FEMALE' | '';
  goal_type: 'LOSE' | 'GAIN' | '';
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  dni?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
  weight?: string;
  height?: string;
  gender?: string;
  goal_type?: string;
  photo?: string;
  general?: string;
}

export default function RegisterForm({ className = '' }: RegisterFormProps) {
  const { register, login } = useAuthContext();
  const { navigateTo } = useAppNavigation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    dni: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    weight: '',
    height: '',
    gender: '',
    goal_type: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'La imagen no puede superar los 5MB' }));
      return;
    }

    setPhotoFile(file);
    setErrors(prev => ({ ...prev, photo: undefined }));
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateField = (field: keyof FormData, value: string) => {
    let error = '';
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    switch (field) {
      case 'first_name':
        if (!value.trim()) error = 'El nombre es requerido';
        else if (!nameRegex.test(value)) error = 'Solo letras y espacios permitidos';
        break;
      case 'last_name':
        if (!value.trim()) error = 'El apellido es requerido';
        else if (!nameRegex.test(value)) error = 'Solo letras y espacios permitidos';
        break;
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = 'El correo electrónico es requerido';
        else if (!emailRegex.test(value)) error = 'Introduce un correo válido';
        break;
      }
      case 'dni':
        if (!value.trim()) error = 'El DNI es requerido';
        else if (!/^\d{7,8}$/.test(value)) error = 'El DNI debe tener 7 u 8 dígitos numéricos';
        break;
      case 'weight':
        if (value) {
          const w = parseFloat(value);
          if (isNaN(w) || w < 40 || w > 200) error = 'El peso debe estar entre 40 y 200 kg';
        }
        break;
      case 'height':
        if (value) {
          const h = parseFloat(value);
          if (isNaN(h) || !Number.isInteger(h) || h < 140 || h > 250) error = 'La altura debe ser un entero entre 140 y 250 cm';
        }
        break;
      case 'password':
        if (!value) error = 'La contraseña es requerida';
        else if (value.length < 8) error = 'Mínimo 8 caracteres';
        
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Las contraseñas no coinciden';
        break;
      case 'birthDate':
        if (!value) error = 'Requerido';
        break;
      case 'gender':
        if (!value) error = 'Selecciona tu género';
        break;
      case 'goal_type':
        if (!value) error = 'Selecciona tu objetivo';
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error || undefined }));
    return !error;
  };

  const validateForm = (): boolean => {
    const fields: (keyof FormData)[] = ['first_name', 'last_name', 'email', 'dni', 'password', 'confirmPassword', 'birthDate', 'gender'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (!formData.goal_type) {
      setErrors(prev => ({ ...prev, goal_type: 'Selecciona tu objetivo' }));
      isValid = false;
    }

    return isValid;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.email);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('password_confirm', formData.confirmPassword);
      formDataToSend.append('dni', formData.dni);
      
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      formDataToSend.append('birthdate', formData.birthDate);
      formDataToSend.append('gender', formData.gender);
      if (formData.weight) formDataToSend.append('weight', formData.weight);
      if (formData.height) formDataToSend.append('height', formData.height);
      if (formData.goal_type) formDataToSend.append('goal_type', formData.goal_type);
      
      if (photoFile) {
        formDataToSend.append('profile_picture', photoFile);
      }

      await register(formDataToSend);
      setSuccess(true);
      
      try {
        setIsLoggingIn(true);
        await login({ email: formData.email, password: formData.password });
        
        // Handle redirect if exists
        const redirectTarget = localStorage.getItem('forcegym_auth_redirect');
        if (redirectTarget) {
          localStorage.removeItem('forcegym_auth_redirect');
          router.push(redirectTarget);
        } else {
          navigateTo('client');
        }
      } catch (loginErr: any) {
        console.error('Auto-login error:', loginErr);
        setIsLoggingIn(false);
        setError('Registro exitoso, pero hubo un problema al iniciar sesión automáticamente. Por favor, ingresa manualmente.');
      }
    } catch (err: any) {
      console.error('Registration full error:', err);
      const apiErrors = err.data || {};
      
      if (typeof apiErrors === 'object' && !Array.isArray(apiErrors)) {
        const newFormErrors: FormErrors = {};
        Object.keys(apiErrors).forEach(key => {
          const msg = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key];
          if (key === 'username' || key === 'email') newFormErrors.email = msg;
          else if (key === 'password_confirm') newFormErrors.confirmPassword = msg;
          else if (key === 'non_field_errors') setError(msg);
          else (newFormErrors as any)[key] = msg;
        });
        if (Object.keys(newFormErrors).length > 0) {
          setErrors(newFormErrors);
        }
      } else {
        setError(err.message || 'Error al registrar. Verifica los datos e intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto px-6 py-8 ${className}`}>
      <button
        type="button"
        onClick={() => navigateTo('login')}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4 text-sm font-medium bg-transparent border-none p-0 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al login
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Crea tu cuenta</h2>
          <p className="text-zinc-400 text-sm">Inicia tu transformación hoy</p>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[11px] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="font-medium tracking-tight">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/5 border border-green-500/20 text-green-500 p-4 rounded-2xl text-[11px] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <p className="font-medium tracking-tight italic">¡Reclutado con éxito! Iniciando sesión...</p>
          </div>
        )}

        {/* Profile Photo Upload Redesigned */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative group">
            <div className={`absolute -inset-1.5 bg-red-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${photoPreview ? 'animate-pulse' : ''}`}></div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#1a1a1a] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover:border-red-600/50 group-hover:scale-[1.02] focus:outline-none"
              title="Subir foto de perfil"
            >
              {photoPreview ? (
                <Image src={photoPreview} alt="Vista previa" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="text-zinc-500 group-hover:text-white transition-colors flex flex-col items-center">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Subir Foto</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="flex flex-col items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Plus className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest">
                    {photoPreview ? 'Cambiar' : 'Añadir'}
                  </span>
                </div>
              </div>
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-medium leading-none">
              Foto de Perfil <span className="text-zinc-400 italic opacity-50 ml-1">(Opcional)</span>
            </p>
            {errors.photo && <p className="text-red-500 text-[10px] mt-2 font-bold animate-pulse">{errors.photo}</p>}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Nombre</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className={`w-full bg-black/40 text-white px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 outline-none
                ${errors.first_name ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
              placeholder="Juan"
            />
            {errors.first_name && <p className="text-red-400 text-[10px] ml-1">{errors.first_name}</p>}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Apellido</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className={`w-full bg-black/40 text-white px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 outline-none
                ${errors.last_name ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
              placeholder="Pérez"
            />
            {errors.last_name && <p className="text-red-400 text-[10px] ml-1">{errors.last_name}</p>}
          </div>

          {/* Gender Selector */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Género *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('gender', 'MALE')}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  formData.gender === 'MALE'
                    ? 'bg-[#ff0400]/10 border-[#ff0400] text-white shadow-[0_0_16px_rgba(255,4,0,0.15)]'
                    : errors.gender
                      ? 'bg-black/40 border-red-500/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                 Hombre
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('gender', 'FEMALE')}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  formData.gender === 'FEMALE'
                    ? 'bg-[#ff0400]/10 border-[#ff0400] text-white shadow-[0_0_16px_rgba(255,4,0,0.15)]'
                    : errors.gender
                      ? 'bg-black/40 border-red-500/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                 Mujer
              </button>
            </div>
            {errors.gender && <p className="text-red-400 text-[10px] ml-1">{errors.gender}</p>}
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Objetivo Fitness *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('goal_type', 'LOSE')}
                className={`flex-1 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  formData.goal_type === 'LOSE'
                    ? 'bg-[#ff0400]/10 border-[#ff0400] text-white shadow-[0_0_16px_rgba(255,4,0,0.15)]'
                    : errors.goal_type
                      ? 'bg-black/40 border-red-500/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                 Perder grasa
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('goal_type', 'GAIN')}
                className={`flex-1 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  formData.goal_type === 'GAIN'
                    ? 'bg-[#ff0400]/10 border-[#ff0400] text-white shadow-[0_0_16px_rgba(255,4,0,0.15)]'
                    : errors.goal_type
                      ? 'bg-black/40 border-red-500/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                 Ganar masa
              </button>
            </div>
            {errors.goal_type && <p className="text-red-400 text-[10px] ml-1">{errors.goal_type}</p>}
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full bg-black/40 text-white px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 outline-none
                ${errors.email ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
              placeholder="nombre@ejemplo.com"
            />
            {errors.email && <p className="text-red-400 text-[10px] ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">DNI</label>
            <input
              type="text"
              value={formData.dni}
              onChange={(e) => handleInputChange('dni', e.target.value)}
              className={`w-full bg-black/40 text-white px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 outline-none
                ${errors.dni ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
              placeholder="12345678"
            />
            {errors.dni && <p className="text-red-400 text-[10px] ml-1">{errors.dni}</p>}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full bg-black/40 text-white px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 outline-none
                ${errors.phone ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
              placeholder="+54 9 11..."
            />
            {errors.phone && <p className="text-red-400 text-[10px] ml-1">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full bg-black/40 text-white px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 outline-none pr-10
                  ${errors.password ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-[10px] ml-1">{errors.password}</p>}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1">Confirmar</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full bg-black/40 text-white px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 outline-none pr-10
                  ${errors.confirmPassword ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-[10px] ml-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1 text-center block">Nacimiento</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`w-full bg-black/40 text-white px-2 py-2.5 rounded-xl border text-[11px] text-center transition-all duration-300 outline-none
                ${errors.birthDate ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1 text-center block">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className={`w-full bg-black/40 text-white px-2 py-2.5 rounded-xl border text-sm text-center transition-all duration-300 outline-none
                ${errors.weight ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
              placeholder="70"
            />
            {errors.weight && <p className="text-red-400 text-[10px] ml-1 text-center">{errors.weight}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-200 ml-1 text-center block">Altura (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              className={`w-full bg-black/40 text-white px-2 py-2.5 rounded-xl border text-sm text-center transition-all duration-300 outline-none
                ${errors.height ? 'border-red-500/50' : 'border-zinc-800 focus:border-white'}`}
              placeholder="175"
            />
            {errors.height && <p className="text-red-400 text-[10px] ml-1 text-center">{errors.height}</p>}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full relative group overflow-hidden py-4 rounded-2xl text-base font-black transition-all duration-500 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
              ${success ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-[#ff0400] hover:text-white'}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 animate-bounce" />
                  Listo
                </>
              ) : 'Comenzar Ahora'}
            </span>
          </button>

          <p className="text-center text-xs text-zinc-500 mt-4 font-medium">
            ¿Ya tienes cuenta?{' '}
            <button 
              type="button"
              onClick={() => navigateTo('login')} 
              className="text-white hover:underline font-bold transition-all bg-transparent border-none p-0 cursor-pointer"
            >
              Inicia Sesión
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
