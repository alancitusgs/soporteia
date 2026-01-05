import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Activity,
  Clock,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { Stats, UnansweredQuestion, DailyStats } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function DashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }

        const [statsRes, dailyRes, unansweredRes] = await Promise.all([
          fetch(`${API_URL}/admin/stats`, { headers }),
          fetch(`${API_URL}/admin/stats/daily?days=7`, { headers }),
          fetch(`${API_URL}/admin/unanswered?limit=20`, { headers }),
        ])

        if (statsRes.ok) setStats(await statsRes.json())
        if (dailyRes.ok) setDailyStats(await dailyRes.json())
        if (unansweredRes.ok) setUnanswered(await unansweredRes.json())
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const chartData = dailyStats.map((d) => ({
    day: new Date(d.fecha).toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase(),
    consultas: d.consultas,
  }))

  const totalPages = Math.ceil(unanswered.length / itemsPerPage)
  const currentUnanswered = unanswered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-8 space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-stone-200 bg-white rounded-xl p-5 hover:border-stone-300 transition-all duration-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-1">Total Consultas Historicas</p>
              <div className="text-2xl font-semibold tracking-tight text-stone-900">
                {stats?.total_consultas.toLocaleString() || 0}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 hover:bg-emerald-50 border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
            {stats?.consultas_semana || 0} esta semana
          </Badge>
        </Card>

        <Card className="border-stone-200 bg-white rounded-xl p-5 hover:border-stone-300 transition-all duration-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-1">Tasa de Precision</p>
              <div className="text-2xl font-semibold tracking-tight text-stone-900">
                {stats?.tasa_exito || 0}%
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg border-4 border-emerald-100 bg-emerald-50 flex items-center justify-center">
              <span className="text-xs font-semibold text-emerald-600">
                {Math.round(stats?.tasa_exito || 0)}
              </span>
            </div>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${stats?.tasa_exito || 0}%` }}
            />
          </div>
        </Card>

        <Card className="border-stone-200 bg-white rounded-xl p-5 hover:border-stone-300 transition-all duration-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-1">Tiempo Promedio</p>
              <div className="text-2xl font-semibold tracking-tight text-stone-900">
                {stats?.tiempo_respuesta_promedio_ms
                  ? `${(stats.tiempo_respuesta_promedio_ms / 1000).toFixed(1)}s`
                  : 'N/A'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 hover:bg-stone-100 border-0">
              Vertex AI
            </Badge>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-semibold text-stone-900">
                Tendencia de Consultas
              </CardTitle>
              <CardDescription className="text-sm text-stone-400 mt-1">
                Actividad semanal del chatbot
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                maxBarSize={40}
                onMouseLeave={() => setActiveBarIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200" vertical={false} />
                <XAxis dataKey="day" className="text-xs text-stone-400" tickLine={false} axisLine={false} />
                <YAxis className="text-xs text-stone-400" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: '#78716c', fontSize: '12px' }}
                  formatter={(value: number) => [`${value} consultas`, '']}
                />
                <Bar
                  dataKey="consultas"
                  radius={[4, 4, 0, 0]}
                  onMouseEnter={(_, index) => setActiveBarIndex(index)}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={activeBarIndex === index ? 'url(#colorGradient)' : '#E7E5E4'}
                      style={{ transition: 'fill 0.2s ease' }}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Unanswered Questions */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="font-semibold text-stone-900">
                Top Preguntas Sin Respuesta
              </CardTitle>
              <Badge className="bg-red-50 text-red-600 text-xs px-2 py-1 hover:bg-red-50 border-0">
                Requieren Atencion
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unanswered.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              No hay preguntas sin respuesta
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-200 hover:bg-transparent">
                    <TableHead className="text-stone-500 font-semibold">Pregunta del Alumno</TableHead>
                    <TableHead className="text-stone-500 font-semibold">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUnanswered.map((item) => (
                    <TableRow key={item.id} className="border-stone-200 hover:bg-stone-50 transition-colors">
                      <TableCell className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-stone-700">
                          {item.pregunta}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-stone-400">
                        {new Date(item.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                  <p className="text-sm text-stone-500">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, unanswered.length)} de {unanswered.length}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? 'bg-gradient-to-r from-red-500 to-orange-400 text-white hover:from-red-600 hover:to-orange-500 rounded-lg'
                            : 'border-stone-200 hover:bg-stone-50 rounded-lg bg-transparent'
                        }
                      >
                        {page}
                      </Button>
                    ))}
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
