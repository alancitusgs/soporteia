import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { UnansweredQuestion } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function UnansweredPage() {
  const { token } = useAuth()
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    const fetchUnanswered = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/unanswered?limit=200`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          setQuestions(await res.json())
        }
      } catch (err) {
        console.error('Error fetching unanswered questions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUnanswered()
  }, [token])

  const totalPages = Math.ceil(questions.length / itemsPerPage)
  const currentQuestions = questions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
          <h1 className="text-xl font-semibold text-stone-900">Preguntas Sin Respuesta</h1>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
            Consultas que el chatbot no pudo responder. Considera agregar esta informacion a la base de conocimiento.
          </p>
        </div>
        <Badge className="bg-red-50 text-red-600 text-sm px-3 py-1.5 hover:bg-red-50 border-0 gap-2">
          <AlertTriangle className="w-4 h-4" />
          {questions.length} pendientes
        </Badge>
      </div>

      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div>
            <CardTitle className="font-semibold text-stone-900">
              Listado de Preguntas
            </CardTitle>
            <CardDescription className="text-sm text-stone-400 mt-1">
              Preguntas de usuarios que no encontraron respuesta en la base de conocimiento
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-stone-300" />
              <p className="text-lg font-medium">No hay preguntas sin respuesta</p>
              <p className="text-sm mt-1">El chatbot esta respondiendo todas las consultas</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-200 hover:bg-transparent">
                    <TableHead className="text-stone-500 font-semibold w-16">#</TableHead>
                    <TableHead className="text-stone-500 font-semibold">Pregunta del Usuario</TableHead>
                    <TableHead className="text-stone-500 font-semibold w-32">Fecha</TableHead>
                    <TableHead className="text-stone-500 font-semibold w-32">Session ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentQuestions.map((question, index) => (
                    <TableRow
                      key={question.id}
                      className="border-stone-200 hover:bg-stone-50 transition-colors"
                    >
                      <TableCell className="text-sm text-stone-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-stone-700">
                          {question.pregunta}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-stone-400">
                        {new Date(question.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-stone-400 font-mono">
                        {question.session_id?.slice(0, 8) || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                  <p className="text-sm text-stone-500">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, questions.length)} de {questions.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-stone-200 hover:bg-stone-50 rounded-lg bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="flex items-center px-3 text-sm text-stone-600">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-stone-200 hover:bg-stone-50 rounded-lg bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
