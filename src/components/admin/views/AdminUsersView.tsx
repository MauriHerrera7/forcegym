'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin, AdminUser } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConfirm } from '@/providers/ConfirmDialogProvider';

export default function AdminUsersView() {
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
          fetchUsers();
        } catch (err) {
          alert('Error al eliminar el usuario: ' + (err as any).message);
        }
      }
    });
  };

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
      case 'premium': return 'bg-[#ff0400]/20 text-[#ff0400] border-[#ff0400]/30';
      case 'standard': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'básico':
      case 'basico': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
            Gestión de Usuarios {loading && <Loader2 className="h-4 w-4 animate-spin inline ml-2 text-[#ff0400]" />}
          </h1>
          <p className="text-zinc-500 font-medium text-sm">Administra todos los usuarios del sistema</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#191919] border-[#404040]">
            <CardContent className="pt-6">
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Total</p>
              <h3 className="text-3xl font-black text-white italic">{users.length}</h3>
            </CardContent>
          </Card>
          <Card className="bg-[#191919] border-[#404040]">
            <CardContent className="pt-6">
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Activos</p>
              <h3 className="text-3xl font-black text-green-500 italic">{users.filter(u => u.is_active).length}</h3>
            </CardContent>
          </Card>
          <Card className="bg-[#191919] border-[#404040]">
            <CardContent className="pt-6">
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Clientes</p>
              <h3 className="text-3xl font-black text-blue-500 italic">{users.filter(u => u.role?.toUpperCase() === 'CLIENT').length}</h3>
            </CardContent>
          </Card>
          <Card className="bg-[#191919] border-[#404040]">
            <CardContent className="pt-6">
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Admins</p>
              <h3 className="text-3xl font-black text-orange-500 italic">{users.filter(u => u.role?.toUpperCase() === 'ADMIN').length}</h3>
            </CardContent>
          </Card>
      </div>

      <Card className="bg-[#191919] border-[#404040]">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle className="text-white text-xl font-normal">Lista de Usuarios</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Buscar usuarios..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111] border-[#333] text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#333] text-left">
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Usuario</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Rol</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Membresía</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Estado</th>
                  <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#333]">
                          <AvatarImage src={user.profile_picture_url || user.profile_picture} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-500 font-bold uppercase">
                            {user.first_name?.[0] || user.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-white italic uppercase tracking-tight text-sm">
                            {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline" className={user.role?.toUpperCase() === 'ADMIN' ? 'border-orange-500/20 text-orange-500' : 'border-blue-500/20 text-blue-500'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline" className={getMembershipColor(user.membership_info?.plan_name)}>
                        {user.membership_info?.plan_name || 'Sin plan'}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                          user.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteUser(user.id)}
                        className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
