import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { FAQ_CATEGORIES } from '../constants'

interface FaqSidebarProps {
  isOpen: boolean
  onClose: () => void
  onQuestionClick: (question: string) => void
}

export function FaqSidebar({ isOpen, onClose, onQuestionClick }: FaqSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Matrícula'])

  const toggleCategory = (title: string) => {
    setExpandedCategories((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 transform border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-gray-900">Preguntas Frecuentes</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 transition-colors hover:bg-gray-100 lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-2">
              {FAQ_CATEGORIES.map((category) => {
                const isExpanded = expandedCategories.includes(category.title)

                return (
                  <div key={category.title} className="rounded-lg border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.title)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-gray-900">{category.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 px-3 pb-3">
                        {category.questions.map((question) => (
                          <button
                            type="button"
                            key={question}
                            onClick={() => onQuestionClick(question)}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-brand-light hover:text-brand"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
            <p>¿No encuentras lo que buscas?</p>
            <p className="mt-1">Escribe tu pregunta en el chat y Tano te ayudará.</p>
          </div>
        </div>
      </aside>
    </>
  )
}
