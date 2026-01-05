import { Menu, X } from 'lucide-react'

interface ChatHeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function ChatHeader({ onToggleSidebar, isSidebarOpen }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-gray-200 bg-brand px-4 py-3 text-brand-foreground shadow-sm">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md p-1.5 transition-colors hover:bg-white/10 lg:hidden"
        aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white">
        <img src="/tano-avatar.png" alt="Tano" className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold">Soporte OAMRA</h1>
        <p className="flex items-center gap-1.5 text-xs text-white/90">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
          En línea
        </p>
      </div>

      <span className="hidden text-xs font-medium text-white/80 sm:block">BETA</span>
    </header>
  )
}
