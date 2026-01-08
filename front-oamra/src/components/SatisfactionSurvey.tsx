import { useState } from 'react'
import { Star, X, Send } from 'lucide-react'

interface SatisfactionSurveyProps {
  sessionId: string
  trigger: 'gracias' | 'inactividad' | 'manual'
  onSubmit: (calificacion: number, comentario?: string) => Promise<boolean>
  onClose: () => void
}

export function SatisfactionSurvey({ sessionId, trigger, onSubmit, onClose }: SatisfactionSurveyProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    const success = await onSubmit(rating, comment.trim() || undefined)
    setIsSubmitting(false)

    if (success) {
      setIsSubmitted(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mx-auto max-w-md shadow-lg animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-emerald-500 fill-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-emerald-800 mb-1">
            ¡Gracias por tu opinión!
          </h3>
          <p className="text-sm text-emerald-600">
            Tu feedback nos ayuda a mejorar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mx-auto max-w-md shadow-lg animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            ¿Cómo fue tu experiencia?
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Tu opinión es muy importante para nosotros
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Cerrar encuesta"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Estrellas */}
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1"
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Etiquetas de calificación */}
      <div className="flex justify-between text-xs text-gray-400 mb-4 px-2">
        <span>Muy mala</span>
        <span>Excelente</span>
      </div>

      {/* Comentario opcional */}
      {rating > 0 && (
        <div className="mb-4 animate-fade-in">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Tienes algún comentario adicional? (opcional)"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
            rows={3}
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {comment.length}/500
          </div>
        </div>
      )}

      {/* Botón de enviar */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
          rating === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar calificación
          </>
        )}
      </button>
    </div>
  )
}
