import { cn } from '../lib/utils'

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
