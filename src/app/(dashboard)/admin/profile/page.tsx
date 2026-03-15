'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pencil, Save, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';

export default function AdminProfile() {
  const { user, loading, updateProfile } = useAuthContext();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dni: '',
    phone: '',
  });
  
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        dni: user.dni || '',
        phone: user.phone || '',
      });
      setPhoto(user.profile_picture_url || user.profile_picture || undefined);
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({ type: 'error', message: 'La imagen no puede superar los 2MB' });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    if (['first_name', 'last_name', 'email'].includes(name) && !value.trim()) {
      error = 'Este campo es requerido';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const isValid = Object.keys(formData).every(key => validateField(key, (formData as any)[key]));
    if (!isValid) {
      setNotification({ type: 'error', message: 'Por favor, corrige los errores antes de guardar.' });
      return;
    }

    try {
      setIsSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('dni', formData.dni);
      formDataToSend.append('phone', formData.phone);
      
      if (photoFile) {
        formDataToSend.append('profile_picture', photoFile);
      }

      await updateProfile(formDataToSend);
      setPhotoFile(null);
      setNotification({ type: 'success', message: '¡Perfil de Administrador actualizado!' });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error updating admin profile:', error);
      setNotification({ type: 'error', message: 'Error al actualizar el perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = user ? (
    formData.first_name !== (user.first_name || '') ||
    formData.last_name !== (user.last_name || '') ||
    formData.phone !== (user.phone || '') ||
    photoFile !== null
  ) : false;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0A0A0A]">
        <Loader2 className="h-12 w-12 animate-spin text-[#ff0400]" />
      </div>
    );
  }

  const initials = `${formData.first_name.charAt(0) || ''}${formData.last_name.charAt(0) || ''}`.toUpperCase() || 'A';
  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mi Perfil Admin</h1>
        <p className="text-gray-400">Administra tu información de administrador</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Form */}
        <Card className="bg-[#191919] border-[#404040]">
          <CardHeader>
            <CardTitle className="text-white">Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            {notification && (
              <Alert 
                variant={notification.type === 'success' ? 'default' : 'destructive'} 
                className={`mb-8 animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-md ${
                  notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500 [&>svg]:text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500 [&>svg]:text-red-500'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="font-bold tracking-tight ml-2">{notification.message}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Header section */}
              <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-[#404040]/30">
                <div className="relative group">
                  {/* Outer Glow Ring */}
                  <div className={`absolute -inset-1.5 bg-[#ff0400] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${photoFile ? 'animate-pulse' : ''}`}></div>
                  
                  {/* Avatar Container */}
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-[#404040] bg-[#1a1a1a] transition-all duration-500 group-hover:border-[#ff0400]/50 group-hover:scale-[1.02]">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={photo} alt={fullName} className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <AvatarFallback className="bg-[#1a1a1a] text-[#ff0400] text-3xl font-black italic tracking-tighter">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Hover Overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-white" />
                      <span className="text-[10px] text-white font-black uppercase tracking-widest">Cambiar</span>
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                
                <div className="text-center md:text-left space-y-2">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ff0400]/10 text-[#ff0400] text-[9px] font-black uppercase tracking-widest border border-[#ff0400]/20">
                    Administrator
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{fullName || 'Admin Account'}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400">
                    <span className="text-sm font-medium">{formData.email}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">ID: {user.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Form Sections */}
              <div className="space-y-8">
                {/* Personal Info Group */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-black text-[#ff0400] tracking-[0.2em] mb-4">Información de Identidad</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Nombre
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={`bg-[#0d0d0d] border-[#404040] text-white focus:border-[#ff0400] h-12 rounded-xl transition-all ${
                          errors.first_name ? 'border-red-500/50 focus:border-red-500' : ''
                        }`}
                      />
                      {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Apellidos
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={`bg-[#0d0d0d] border-[#404040] text-white focus:border-[#ff0400] h-12 rounded-xl transition-all ${
                          errors.last_name ? 'border-red-500/50 focus:border-red-500' : ''
                        }`}
                      />
                      {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dni" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        DNI (Solo Lectura)
                      </Label>
                      <Input
                        id="dni"
                        name="dni"
                        value={formData.dni}
                        disabled
                        className="bg-[#0a0a0a] border-[#2a2a2a] text-zinc-600 h-12 rounded-xl cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info Group */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-[10px] uppercase font-black text-[#ff0400] tracking-[0.2em] mb-4">Información de Contacto</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Email (Solo Lectura)
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-[#0a0a0a] border-[#2a2a2a] text-zinc-600 h-12 rounded-xl cursor-not-allowed opacity-70"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Teléfono Móvil
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="bg-[#0d0d0d] border-[#404040] text-white focus:border-[#ff0400] h-12 rounded-xl transition-all"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>
                  </div>
                </div>
              </div>

               <Button 
                 type="submit" 
                 disabled={isSaving || !isDirty}
                 className={`w-full relative group overflow-hidden py-7 rounded-2xl text-sm font-black uppercase tracking-[0.3em] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-[0_10px_30px_rgba(0,0,0,0.4)]
                  ${isSaving ? 'bg-zinc-800' : isDirty ? 'bg-white text-black hover:bg-[#ff0400] hover:text-white' : 'bg-zinc-900 text-zinc-600'}`}
               >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Guardar Perfil
                    </>
                  )}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
