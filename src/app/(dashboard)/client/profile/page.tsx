'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pencil, Save, X, Camera, Plus, Loader2, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthContext } from '@/providers/AuthProvider';

export default function ClientProfile() {
  const { user, loading, updateProfile } = useAuthContext();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dni: '',
    birthDate: '',
    weight: '',
    height: '',
    goal_type: '' as 'LOSE' | 'GAIN' | '',
  });
  
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
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
        birthDate: user.birthdate || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        goal_type: user.profile?.goal_type || '',
      });
      setPhoto(user.profile_picture_url || user.profile_picture || undefined);
    }
  }, [user]);

  // Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const userId = user?.id || 'UNKNOWN';
        const baseUrl = window.location.origin;
        const qrData = `${baseUrl}/admin/verify/${userId}`;
        
        // Small QR for card
        if (canvasRef.current && user?.id) {
          await QRCode.toCanvas(canvasRef.current, qrData, {
            width: 200,
            margin: 2,
            color: {
              dark: '#ff0400',
              light: '#ffffff',
            },
          });
        }
        
        // Generate data URL for modal
        if (user?.id) {
          const url = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
              dark: '#ff0400',
              light: '#ffffff',
            },
          });
          setQrCodeUrl(url);
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    if (user) {
       generateQR();
    }
  }, [user]);

  // Generate large QR for modal when opened
  useEffect(() => {
    if (isQRModalOpen && modalCanvasRef.current && user) {
      const generateLargeQR = async () => {
        try {
          const userId = user.id;
          const baseUrl = window.location.origin;
          const qrData = `${baseUrl}/admin/verify/${userId}`;
          
          await QRCode.toCanvas(modalCanvasRef.current!, qrData, {
            width: 600,
            margin: 3,
            color: {
              dark: '#ff0400',
              light: '#ffffff',
            },
          });
        } catch (err) {
          console.error('Error generating large QR code:', err);
        }
      };
      
      generateLargeQR();
    }
  }, [isQRModalOpen, user]);

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
    
    if (['first_name', 'last_name', 'birthDate'].includes(name) && !value.trim()) {
      error = 'Este campo es requerido';
    } else if (name === 'weight' || name === 'height') {
      if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
        error = 'Ingresa un valor válido';
      }
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

    // Validate all fields before submitting
    const newErrors: Record<string, string> = {};
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateField(key, (formData as any)[key])) {
        isValid = false;
      }
    });

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
      formDataToSend.append('birthdate', formData.birthDate);
      if (formData.weight) formDataToSend.append('weight', formData.weight);
      if (formData.height) formDataToSend.append('height', formData.height);
      if (formData.goal_type) {
        formDataToSend.append('goal_type', formData.goal_type);
      }
      
      if (photoFile) {
        formDataToSend.append('profile_picture', photoFile);
      }

      await updateProfile(formDataToSend);
      
      setNotification({ type: 'success', message: '¡Perfil actualizado correctamente!' });
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setNotification({ type: 'error', message: error.message || 'Error al actualizar el perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = user ? (
    formData.first_name !== (user.first_name || '') ||
    formData.last_name !== (user.last_name || '') ||
    formData.birthDate !== (user.birthdate || '') ||
    formData.weight !== (user.weight?.toString() || '') ||
    formData.height !== (user.height?.toString() || '') ||
    formData.goal_type !== (user.profile?.goal_type || '') ||
    photoFile !== null
  ) : false;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const initials = `${formData.first_name.charAt(0) || ''}${formData.last_name.charAt(0) || ''}`.toUpperCase() || 'U';
  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Mi Perfil</h1>
        <p className="text-gray-400 text-sm">Administra tu información personal</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="bg-[#191919] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white">Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile QR Button */}
              <div className="lg:hidden mb-6">
                <Button 
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="w-full bg-[#ff0400]/10 border border-[#ff0400]/20 text-[#ff0400] hover:bg-[#ff0400]/20 gap-3 h-14 font-black uppercase tracking-[0.2em] italic rounded-2xl shadow-lg shadow-red-600/5 transition-all duration-300"
                >
                  <QrCode className="h-6 w-6" />
                  Tu QR de Acceso
                </Button>
              </div>

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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload Redesigned - Dashboard Style */}
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 text-center sm:text-left">
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1"
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
                  
                  <div className="space-y-1">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ff0400]/10 text-[#ff0400] text-[9px] font-black uppercase tracking-widest border border-[#ff0400]/20 mb-1">
                      Socio Activo
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{fullName || 'Guerrero'}</h3>
                    <p className="text-sm text-zinc-400 font-medium">{formData.email}</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                        <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Peso</p>
                        <p className="text-sm text-white font-bold">{formData.weight ? `${formData.weight}kg` : '--'}</p>
                      </div>
                      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                        <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Altura</p>
                        <p className="text-sm text-white font-bold">{formData.height ? `${formData.height}cm` : '--'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-gray-300">
                      Nombre
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`bg-[#191919] border-[#404040] text-white focus:border-[#ff0400] transition-colors ${
                        errors.first_name ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-gray-300">
                      Apellidos
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`bg-[#191919] border-[#404040] text-white focus:border-[#ff0400] transition-colors ${
                        errors.last_name ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="bg-[#191919] border-[#404040] text-gray-400 focus:border-[#ff0400] cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni" className="text-gray-300">
                      DNI
                    </Label>
                    <Input
                      id="dni"
                      name="dni"
                      value={formData.dni}
                      disabled
                      className="bg-[#191919] border-[#404040] text-gray-500 cursor-not-allowed"
                    />
                    {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-gray-300">
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className={`bg-[#191919] border-[#404040] text-white focus:border-[#ff0400] transition-colors ${
                        errors.birthDate ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.birthDate && <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-300">
                      Peso (kg)
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className={`bg-[#191919] border-[#404040] text-white focus:border-[#ff0400] transition-colors ${
                        errors.weight ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-gray-300">
                      Altura (cm)
                    </Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleInputChange}
                      className={`bg-[#191919] border-[#404040] text-white focus:border-[#ff0400] transition-colors ${
                        errors.height ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
                  </div>

                  {/* Goal Type Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-300">Objetivo Fitness</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, goal_type: 'LOSE' }))}
                        className={`py-6 rounded-2xl border-2 text-sm font-black uppercase tracking-[0.2em] italic transition-all duration-500 shadow-lg ${
                          formData.goal_type === 'LOSE'
                            ? 'bg-[#ff0400]/10 border-[#ff0400] text-white shadow-red-600/10'
                            : 'bg-[#1a1a1a] border-[#262626] text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                        }`}
                      >
                        Perder Grasa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, goal_type: 'GAIN' }))}
                        className={`py-6 rounded-2xl border-2 text-sm font-black uppercase tracking-[0.2em] italic transition-all duration-500 shadow-lg ${
                          formData.goal_type === 'GAIN'
                            ? 'bg-[#ff0400]/10 border-[#ff0400] text-white shadow-red-600/10'
                            : 'bg-[#1a1a1a] border-[#262626] text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                        }`}
                      >
                        Ganar Masa
                      </button>
                    </div>
                  </div>
                </div>

                 <Button 
                   type="submit" 
                   disabled={isSaving || !isDirty}
                   className={`w-full relative group overflow-hidden py-6 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-xl
                    ${isSaving ? 'bg-zinc-800' : isDirty ? 'bg-white text-black hover:bg-[#ff0400] hover:text-white' : 'bg-zinc-800 text-zinc-500'}`}
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

        {/* QR Code Card Redesigned */}
        <div className="lg:col-span-1">
          <Card className="bg-[#191919] border-[#404040] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
               <div className="h-2 w-2 rounded-full bg-[#ff0400] animate-ping" />
            </div>
            
            <CardHeader>
              <CardTitle className="text-white text-xs uppercase tracking-[0.3em] font-black italic">Acceso Digital</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="relative p-2 bg-gradient-to-br from-white to-zinc-300 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 cursor-pointer"
                   onClick={() => setIsQRModalOpen(true)}>
                <div className="absolute inset-0 bg-red-600 rounded-3xl blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                <div className="bg-white p-3 rounded-2xl relative z-10">
                  <canvas ref={canvasRef} className="rounded-lg" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Tu Pase de Guerrero</p>
                <p className="text-xs text-zinc-400 font-medium font-bold">Escanea en la recepción para ingresar</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="bg-[#191919] border-none sm:max-w-md p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-[#111111] border-b border-[#404040] relative">
            <DialogTitle className="text-white text-center text-xl font-bold uppercase tracking-wider">
              Tu Código QR de Acceso
            </DialogTitle>
            <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 hover:bg-[#404040] hover:text-white transition-all">
              <X className="h-6 w-6" />
            </DialogClose>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-8 p-10 bg-[#191919]">
            <div className="rounded-2xl bg-white p-6 shadow-[0_0_50px_rgba(255,4,0,0.15)] flex items-center justify-center">
              <QRCodeSVG 
                value={`${window.location.origin}/admin/verify/${user.id}`} 
                size={280}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-lg text-gray-200 font-medium">
                Escanea este código en la entrada
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#ff0400]/10 text-[#ff0400] text-sm font-bold border border-[#ff0400]/20">
                ID: {user.id}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
