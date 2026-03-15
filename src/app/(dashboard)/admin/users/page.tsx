'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin, AdminUser } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useConfirm } from '@/providers/ConfirmDialogProvider';

export default function AdminUsersPage() {
  const { confirm } = useConfirm();
  const { getUsers, toggleUserStatus, deleteUser: deleteUserApi, loading } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'client'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchUsers = useCallback(async () => {
    const data = await getUsers();
    setUsers(data);
  }, [getUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    confirm({
      title: '¿Eliminar usuario permanentemente?',
      description: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await deleteUserApi(userId);
          // Refresh list
          fetchUsers();
          toast.success('Usuario eliminado');
        } catch (err: any) {
          toast.error('Error al eliminar el usuario: ' + (err.message || 'Error desconocido'));
        }
      }
    });
  };

  // Filter users
  const filteredUsers = (users || []).filter(user => {
    const fullName = `${user.full_name || ''} ${user.first_name || ''} ${user.last_name || ''} ${user.username || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? user.is_active : !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getMembershipColor = (membership: string | undefined) => {
    if (!membership) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    switch (membership.toLowerCase()) {
      case 'premium':
        return 'bg-[#ff0400]/20 text-[#ff0400] border-[#ff0400]/30';
      case 'standard':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'básico':
      case 'basico':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role?.toUpperCase() === 'ADMIN').length,
    clients: users.filter(u => u.role?.toUpperCase() === 'CLIENT').length,
  };

  const activePercentage = Math.round((stats.active / stats.total) * 100) || 0;
  const inactivePercentage = Math.round((stats.inactive / stats.total) * 100) || 0;
  
  // Ajustar para que sumen 100 si hay decimales, o usar el cálculo directo
  
  const adminPercentage = Math.round((stats.admins / stats.total) * 100) || 0;
  const clientPercentage = Math.round((stats.clients / stats.total) * 100) || 0;

  // Function to render donut chart
  const renderDonutChart = (
    primaryPercent: number, 
    secondaryPercent: number, 
    primaryColor: string, 
    secondaryColor: string, 
    centerLabel: string, 
    centerValue: string | number
  ) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const primaryDash = (primaryPercent / 100) * circumference;
    const secondaryDash = circumference - primaryDash; // Simplification for 2 segments

    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
           {/* Background Circle (Secondary) */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={secondaryColor}
            strokeWidth="12"
            fill="none"
          />
          {/* Primary Circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={primaryColor}
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${primaryDash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-white">{centerValue}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{centerLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestión de Usuarios {loading && <span className="text-sm font-normal text-gray-500 ml-2 italic">Cargando...</span>}</h1>
          <p className="text-gray-400 text-sm">Administra todos los usuarios del sistema</p>
        </div>
      </div>

      {/* ... (rest of stats cards) */}

      {/* Users Table */}
      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-white">
              Lista de Usuarios
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 p-4">
          {/* Mobile View (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-[#202020] p-4 rounded-xl border border-[#404040] space-y-4">
                {/* Header: User Info & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-[#404040]">
                      <AvatarImage src={user.profile_picture_url || user.profile_picture} alt={user.first_name || 'User'} />
                      <AvatarFallback className="bg-[#ff0400] text-white font-semibold">
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white text-sm">
                        {user.full_name || (user.first_name || user.last_name ? 
                          `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                          : user.username || user.email || 'Usuario')}
                      </p>
                      <p className="text-xs text-gray-400">
                         {user.created_at && new Date(user.created_at).toString() !== 'Invalid Date' 
                           ? format(new Date(user.created_at), "d MMM yyyy", { locale: es }) 
                           : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                  {/* Status Toggle */}
                  <div className="flex flex-col items-center gap-1">
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={() => handleToggleStatus(user.id)}
                      disabled={loading}
                    />
                    <span className={`text-[10px] font-medium ${user.is_active ? 'text-green-400' : 'text-gray-500'}`}>
                      {user.is_active ? 'Activo' : 'Inact.'}
                    </span>
                  </div>
                </div>

                {/* Body: Role & Membresia */}
                <div className="grid grid-cols-2 gap-2 pb-1">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rol</p>
                    <Badge
                      variant="outline"
                      className={user.role?.toUpperCase() === 'ADMIN' 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }
                    >
                      {user.role?.toUpperCase() === 'ADMIN' ? '👑 Admin' : '👤 Cliente'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Membresía</p>
                    <Badge
                      variant="outline"
                      className={getMembershipColor(user.membership_info?.plan_name)}
                    >
                       {user.membership_info?.plan_name || 'Sin membresía'}
                    </Badge>
                  </div>
                </div>

                {/* Footer: Actions */}
                <div className="flex justify-end pt-3 border-t border-[#404040]/50">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteUser(user.id)}
                    className="border-red-500/30 hover:bg-red-500/20 text-red-400 h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No se encontraron usuarios</p>
              </div>
            )}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-[#404040]">
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Usuario</TableHead>
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Rol</TableHead>
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Membresía</TableHead>
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Estado</TableHead>
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Fecha Registro</TableHead>
                  <TableHead className="text-gray-400 text-right py-3">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-[#404040]/50 hover:bg-[#404040]/20 transition-colors"
                  >
                    {/* Usuario */}
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-[#404040]">
                          <AvatarImage src={user.profile_picture_url || user.profile_picture} alt={user.first_name} />
                          <AvatarFallback className="bg-[#ff0400] text-white font-semibold">
                            {user.first_name?.[0] || user.username?.[0] || 'U'}
                            {user.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">
                            {user.full_name || (user.first_name || user.last_name ? 
                              `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                              : user.username || user.email || 'Usuario')}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Rol */}
                    <TableCell className="py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={user.role?.toUpperCase() === 'ADMIN' 
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }
                      >
                        {user.role?.toUpperCase() === 'ADMIN' ? '👑 Admin' : '👤 Cliente'}
                      </Badge>
                    </TableCell>

                    {/* Membresía */}
                    <TableCell className="py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={getMembershipColor(user.membership_info?.plan_name)}
                      >
                        {user.membership_info?.plan_name || 'Sin membresía'}
                      </Badge>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => handleToggleStatus(user.id)}
                          disabled={loading}
                        />
                        <span className={`text-xs font-medium ${
                          user.is_active ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-400">
                        {user.created_at ? (
                          new Date(user.created_at).toString() !== 'Invalid Date' ? (
                            format(new Date(user.created_at), "d 'de' MMM, yyyy", { locale: es })
                          ) : 'Fecha Inválida'
                        ) : 'Sin fecha'}
                      </p>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUser(user.id)}
                          className="border-red-500/30 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
