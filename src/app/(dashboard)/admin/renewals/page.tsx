'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin, AdminUser } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RefreshCw, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function AdminRenewalsPage() {
  const { getUsers, loading: adminLoading } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Obtenemos todos los usuarios y filtramos los que tienen membresía próxima a vencer o vencida
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users for renewals:', err);
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getMembershipStatus = (endDate: string | undefined) => {
    if (!endDate) return 'expired';
    const expiration = new Date(endDate);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 7) return 'soon';
    return 'active';
  };

  const getDaysRemaining = (endDate: string | undefined) => {
    if (!endDate) return 0;
    const expiration = new Date(endDate);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredUsers = users
    .filter(user => {
      // Excluir usuarios que nunca tuvieron membresía
      if (!user.membership_info) return false;
      
      const fullName = `${user.full_name || ''} ${user.first_name || ''} ${user.last_name || ''} ${user.username || ''}`;
      const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const status = getMembershipStatus(user.membership_info?.end_date);
      // Solo mostrar vencidas o por vencer para esta página
      return matchesSearch && (status === 'expired' || status === 'soon');
    })
    .sort((a, b) => {
      const daysA = getDaysRemaining(a.membership_info?.end_date);
      const daysB = getDaysRemaining(b.membership_info?.end_date);
      return daysA - daysB;
    });

  const handleRenewClick = (user: AdminUser) => {
    setSelectedUser(user);
    setIsRenewalModalOpen(true);
  };

  const confirmRenewal = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

        // Usamos el endpoint estándar del router para crear membresías
        // ID encontrado en la base de datos: 6ab4cc85-01c5-4cd3-8990-ae6831bcb088 (Mensual)
        await fetchApi(`/memberships/user-memberships/`, {
          method: 'POST',
          body: JSON.stringify({
            user: selectedUser.id,
            plan: '6ab4cc85-01c5-4cd3-8990-ae6831bcb088',
            start_date: today,
            end_date: nextMonth,
            status: 'ACTIVE',
            notes: 'Renovación manual por administrador'
          })
        });
        
        await fetchUsers(); // Refrescar lista
        setIsRenewalModalOpen(false);
        setSelectedUser(null);
      } catch (err: any) {
        console.error('Error renewing membership:', err);
        toast.error('Error al renovar membresía: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string, days: number) => {
    if (status === 'expired') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Vencida hace {Math.abs(days)} días</Badge>;
    } else if (status === 'soon') {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Vence en {days} días</Badge>;
    } else {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activa</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 w-full overflow-hidden">
      <div className="flex items-center justify-between px-2 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Renovaciones</h1>
          <p className="text-gray-400">Gestiona las membresías por vencer o vencidas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#191919] border-[#404040]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Próximos Vencimientos</p>
              <div className="text-3xl font-semibold text-yellow-400">
                {users.filter(u => u.membership_info && getMembershipStatus(u.membership_info.end_date) === 'soon').length}
              </div>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-[#191919] border-[#404040]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Vencidas</p>
              <div className="text-3xl font-semibold text-red-400">
                {users.filter(u => u.membership_info && getMembershipStatus(u.membership_info.end_date) === 'expired').length}
              </div>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-[#191919] border-[#404040]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">A Renovar (Listado)</p>
              <div className="text-3xl font-semibold text-green-400">
                {filteredUsers.length}
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400 opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-white">Usuarios {loading && <span className="text-sm font-normal text-gray-500 italic ml-2">Actualizando...</span>}</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#191919] border-[#404040] text-white focus:border-[#ff0400] w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Mobile View (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredUsers.map((user) => {
              const status = getMembershipStatus(user.membership_info?.end_date);
              const days = getDaysRemaining(user.membership_info?.end_date);
              
              return (
                <div key={user.id} className="bg-[#202020] p-4 rounded-xl border border-[#404040] space-y-4">
                  {/* Header: User & Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-[#404040]">
                        <AvatarImage src={user.profile_picture_url || user.profile_picture} alt={user.first_name || user.username} />
                        <AvatarFallback className="bg-[#ff0400] text-white font-semibold">
                          {user.first_name?.[0] || user.username?.[0] || 'U'}
                          {user.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {user.full_name || (user.first_name || user.last_name ? 
                            `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                            : user.username || 'Usuario')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.membership_info?.plan_name || 'Sin plan'}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right flex flex-col items-end gap-1">
                      {getStatusBadge(status, days)}
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        {user.membership_info?.end_date 
                          ? new Date(user.membership_info.end_date).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Footer: Actions */}
                  <div className="flex justify-end pt-3 border-t border-[#404040]/50">
                    <Button
                      size="sm"
                      className={`${
                        status === 'active' 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed hover:bg-gray-700' 
                          : 'bg-[#ff0400] hover:bg-[#ff3936] text-white flex-1'
                      } gap-2`}
                      onClick={() => status !== 'active' && handleRenewClick(user)}
                      disabled={status === 'active' || loading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      {status === 'active' ? 'Al día' : 'Renovar'}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm italic">No se encontraron renovaciones pendientes.</p>
              </div>
            )}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-[#404040]">
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Usuario</TableHead>
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Membresía</TableHead>
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Estado</TableHead>
                  <TableHead className="text-gray-400 whitespace-nowrap py-3">Vencimiento</TableHead>
                  <TableHead className="text-gray-400 text-right py-3">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const status = getMembershipStatus(user.membership_info?.end_date);
                  const days = getDaysRemaining(user.membership_info?.end_date);
                  
                  return (
                    <TableRow key={user.id} className="border-[#404040]/50 hover:bg-[#404040]/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-[#404040]">
                            <AvatarImage src={user.profile_picture_url || user.profile_picture} alt={user.first_name || user.username} />
                            <AvatarFallback className="bg-[#ff0400] text-white font-semibold">
                              {user.first_name?.[0] || user.username?.[0] || 'U'}
                              {user.last_name?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">
                              {user.full_name || (user.first_name || user.last_name ? 
                                `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                                : user.username || 'Usuario')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <Badge variant="outline" className="border-[#404040] text-gray-300">
                          {user.membership_info?.plan_name || 'Sin plan'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        {getStatusBadge(status, days)}
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {user.membership_info?.end_date 
                            ? new Date(user.membership_info.end_date).toLocaleDateString('es-ES')
                            : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          size="sm"
                          className={`${
                            status === 'active' 
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed hover:bg-gray-700' 
                              : 'bg-[#ff0400] hover:bg-[#ff3936] text-white'
                          } gap-2`}
                          onClick={() => status !== 'active' && handleRenewClick(user)}
                          disabled={status === 'active' || loading}
                        >
                          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                          {status === 'active' ? 'Al día' : 'Renovar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Renewal Modal */}
      <Dialog open={isRenewalModalOpen} onOpenChange={setIsRenewalModalOpen}>
        <DialogContent className="bg-[#191919] border-[#404040] text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Renovación</DialogTitle>
            <DialogDescription className="text-gray-400">
              Estás a punto de renovar la membresía para este usuario.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[#404040]/30 border border-[#404040]">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.profile_picture_url || selectedUser.profile_picture} alt={selectedUser.first_name || selectedUser.username} />
                  <AvatarFallback className="bg-[#ff0400] text-white">
                    {selectedUser.first_name?.[0] || selectedUser.username?.[0] || 'U'}
                    {selectedUser.last_name?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-lg text-white">
                    {selectedUser.full_name || (selectedUser.first_name || selectedUser.last_name ? 
                      `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() 
                      : selectedUser.username || 'Usuario')}
                  </h4>
                  <p className="text-gray-400">{selectedUser.membership_info?.plan_name || 'Sin membresía'}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Vencimiento actual:</span>
                <span className="text-red-400 font-medium">
                  {selectedUser.membership_info?.end_date 
                    ? new Date(selectedUser.membership_info.end_date).toLocaleDateString()
                    : 'Expirado'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Nuevo vencimiento:</span>
                <span className="text-green-400 font-bold">
                  {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewalModalOpen(false)} className="border-[#404040] hover:bg-[#404040] text-white">
              Cancelar
            </Button>
            <Button onClick={confirmRenewal} className="bg-[#ff0400] hover:bg-[#ff3936] text-white">
              Confirmar Renovación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
