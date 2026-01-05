import { NavLink } from 'react-router-dom'
import {
  Home,
  MessageSquare,
  AlertTriangle,
  Users,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  {
    section: 'General',
    items: [
      { path: '/', icon: Home, label: 'Dashboard', end: true },
      { path: '/conversations', icon: MessageSquare, label: 'Logs de Chat' },
    ]
  },
  {
    section: 'Atencion Requerida',
    items: [
      { path: '/unanswered', icon: AlertTriangle, label: 'Preguntas Sin Respuesta' },
    ]
  },
  {
    section: 'Administracion',
    adminOnly: true,
    items: [
      { path: '/users', icon: Users, label: 'Gestion de Usuarios' },
      { path: '/settings', icon: Settings, label: 'Configuracion del Sistema' },
    ]
  }
]

export function Sidebar() {
  const { logout, isAdmin, user } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 border-b border-stone-200 flex items-center gap-3 px-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
          <span className="text-white text-sm font-bold">T</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-stone-900">Tano Admin</span>
          <span className="text-xs text-stone-400">Intelligence</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((section, idx) => {
          const isAdminSection = section.adminOnly && !isAdmin

          if (isAdminSection) return null

          return (
            <div key={idx} className="mb-6">
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  {section.section}
                </span>
                {section.adminOnly && isAdmin && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-stone-300 text-stone-500">
                    Admin
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-stone-100 text-stone-900'
                          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-stone-200 p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-violet-600 text-white text-xs font-semibold">
              {user?.nombre?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-stone-900 truncate">
              {user?.nombre || 'Usuario'}
            </div>
            <div className="text-xs text-stone-400 truncate capitalize">
              {user?.rol || 'Sin rol'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 mt-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesion
        </Button>
      </div>
    </aside>
  )
}
