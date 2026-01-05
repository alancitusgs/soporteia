import { useLocation } from 'react-router-dom'
import { Home, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/conversations': 'Logs de Conversaciones',
  '/unanswered': 'Preguntas Sin Respuesta',
  '/users': 'Gestion de Usuarios',
}

export function Header() {
  const location = useLocation()
  const { logout } = useAuth()

  const title = routeTitles[location.pathname] || 'Dashboard'

  return (
    <header className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-8">
      <div className="flex items-center gap-2 text-sm text-stone-400">
        <Home className="w-4 h-4" />
        <ChevronRight className="w-3 h-3" />
        <span className="text-stone-900 font-medium">{title}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="gap-2 rounded-lg border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200 bg-transparent"
        onClick={logout}
      >
        <LogOut className="w-4 h-4" />
        Cerrar Sesion
      </Button>
    </header>
  )
}
