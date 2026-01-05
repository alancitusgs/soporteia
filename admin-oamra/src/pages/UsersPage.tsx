import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, UserPlus, Trash2, Edit } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/hooks/use-toast'
import type { User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function UsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'reportes' as 'admin' | 'reportes',
  })
  const [editForm, setEditForm] = useState({
    nombre: '',
    rol: 'reportes' as 'admin' | 'reportes',
    activo: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Error al crear usuario')
      }

      const createdUser = newUser.nombre
      setNewUser({ nombre: '', email: '', password: '', rol: 'reportes' })
      setIsAddModalOpen(false)
      fetchUsers()
      toast({
        variant: 'success',
        title: 'Usuario creado exitosamente',
        description: `${createdUser} ha sido agregado al sistema.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario')
      toast({
        variant: 'destructive',
        title: 'Error al crear usuario',
        description: err instanceof Error ? err.message : 'Ocurrio un error inesperado',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    const userToDelete = users.find((u) => u.id === userId)
    if (!confirm(`¿Estas seguro de eliminar a ${userToDelete?.nombre || 'este usuario'}?`)) return

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        fetchUsers()
        toast({
          variant: 'success',
          title: 'Usuario eliminado',
          description: `${userToDelete?.nombre || 'El usuario'} ha sido eliminado del sistema.`,
        })
      } else {
        throw new Error('Error al eliminar usuario')
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      toast({
        variant: 'destructive',
        title: 'Error al eliminar usuario',
        description: 'No se pudo eliminar el usuario. Intenta nuevamente.',
      })
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !user.activo }),
      })

      if (res.ok) {
        fetchUsers()
        toast({
          variant: 'success',
          title: user.activo ? 'Usuario desactivado' : 'Usuario activado',
          description: `${user.nombre} ahora esta ${user.activo ? 'inactivo' : 'activo'}.`,
        })
      }
    } catch (err) {
      console.error('Error updating user:', err)
      toast({
        variant: 'destructive',
        title: 'Error al cambiar estado',
        description: 'No se pudo cambiar el estado del usuario.',
      })
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setEditForm({
      nombre: user.nombre,
      rol: user.rol,
      activo: user.activo,
    })
    setError('')
    setIsEditModalOpen(true)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Error al actualizar usuario')
      }

      const updatedUserName = editForm.nombre
      setIsEditModalOpen(false)
      setEditingUser(null)
      fetchUsers()
      toast({
        variant: 'success',
        title: 'Usuario actualizado',
        description: `Los datos de ${updatedUserName} han sido actualizados.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario')
      toast({
        variant: 'destructive',
        title: 'Error al actualizar usuario',
        description: err instanceof Error ? err.message : 'Ocurrio un error inesperado',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Gestion de Usuarios</h1>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
            Administra los usuarios que tienen acceso al dashboard
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-lg px-4 hover:from-red-600 hover:to-orange-500 transition-all duration-200 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Agregar Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Total Usuarios</p>
                <p className="text-2xl font-semibold text-stone-900 mt-0.5">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 rounded-lg">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Administradores</p>
                <p className="text-2xl font-semibold text-stone-900 mt-0.5">
                  {users.filter((u) => u.rol === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Reportes</p>
                <p className="text-2xl font-semibold text-stone-900 mt-0.5">
                  {users.filter((u) => u.rol === 'reportes').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-stone-900">Lista de Usuarios</CardTitle>
          <CardDescription className="text-sm text-stone-400 mt-1">
            Usuarios con acceso al dashboard de administracion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-stone-200 hover:bg-transparent">
                <TableHead className="text-stone-500 font-semibold">Nombre</TableHead>
                <TableHead className="text-stone-500 font-semibold">Email</TableHead>
                <TableHead className="text-stone-500 font-semibold">Rol</TableHead>
                <TableHead className="text-stone-500 font-semibold">Estado</TableHead>
                <TableHead className="text-stone-500 font-semibold">Ultimo Login</TableHead>
                <TableHead className="text-stone-500 font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-stone-200 hover:bg-stone-50 transition-colors">
                  <TableCell className="font-medium text-stone-700">{user.nombre}</TableCell>
                  <TableCell className="text-stone-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.rol === 'admin'
                          ? 'bg-violet-50 text-violet-600 border-0'
                          : 'bg-stone-100 text-stone-600 border-0'
                      }
                    >
                      {user.rol === 'admin' ? 'Administrador' : 'Reportes'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.activo
                          ? 'bg-emerald-50 text-emerald-600 border-0 cursor-pointer'
                          : 'bg-red-50 text-red-600 border-0 cursor-pointer'
                      }
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-stone-400">
                    {user.ultimo_login
                      ? new Date(user.ultimo_login).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Nunca'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[480px] border-stone-200 rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">
              Agregar Nuevo Usuario
            </DialogTitle>
            <DialogDescription className="text-sm text-stone-500 mt-2">
              Complete la informacion para crear un nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-5 mt-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-stone-700">
                Nombre Completo
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Maria Torres"
                value={newUser.nombre}
                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                className="bg-stone-50 border-stone-200 focus-visible:ring-stone-300 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                Correo Electronico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="maria.torres@upch.pe"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-stone-50 border-stone-200 focus-visible:ring-stone-300 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                Contrasena
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-stone-50 border-stone-200 focus-visible:ring-stone-300 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol" className="text-sm font-medium text-stone-700">
                Rol Asignado
              </Label>
              <Select
                value={newUser.rol}
                onValueChange={(value: 'admin' | 'reportes') =>
                  setNewUser({ ...newUser, rol: value })
                }
              >
                <SelectTrigger className="bg-stone-50 border-stone-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-stone-200 rounded-lg">
                  <SelectItem value="admin" className="rounded-md">
                    Administrador
                  </SelectItem>
                  <SelectItem value="reportes" className="rounded-md">
                    Reportes
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-400 mt-1">
                Los administradores tienen acceso completo, los de reportes solo ven estadisticas
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 rounded-lg border-stone-200 hover:bg-stone-50 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2 bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-lg hover:from-red-600 hover:to-orange-500 transition-all duration-200 shadow-sm"
                disabled={isSubmitting}
              >
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px] border-stone-200 rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">
              Editar Usuario
            </DialogTitle>
            <DialogDescription className="text-sm text-stone-500 mt-2">
              Modifica la informacion del usuario: {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-5 mt-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-nombre" className="text-sm font-medium text-stone-700">
                Nombre Completo
              </Label>
              <Input
                id="edit-nombre"
                placeholder="Ej: Maria Torres"
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="bg-stone-50 border-stone-200 focus-visible:ring-stone-300 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rol" className="text-sm font-medium text-stone-700">
                Rol Asignado
              </Label>
              <Select
                value={editForm.rol}
                onValueChange={(value: 'admin' | 'reportes') =>
                  setEditForm({ ...editForm, rol: value })
                }
              >
                <SelectTrigger className="bg-stone-50 border-stone-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-stone-200 rounded-lg">
                  <SelectItem value="admin" className="rounded-md">
                    Administrador
                  </SelectItem>
                  <SelectItem value="reportes" className="rounded-md">
                    Reportes
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-400 mt-1">
                Los administradores tienen acceso completo, los de reportes solo ven estadisticas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-activo" className="text-sm font-medium text-stone-700">
                Estado
              </Label>
              <Select
                value={editForm.activo ? 'true' : 'false'}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, activo: value === 'true' })
                }
              >
                <SelectTrigger className="bg-stone-50 border-stone-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-stone-200 rounded-lg">
                  <SelectItem value="true" className="rounded-md">
                    Activo
                  </SelectItem>
                  <SelectItem value="false" className="rounded-md">
                    Inactivo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-lg border-stone-200 hover:bg-stone-50 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                disabled={isSubmitting}
              >
                <Edit className="w-4 h-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
