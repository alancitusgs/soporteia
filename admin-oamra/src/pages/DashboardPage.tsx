import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MessageSquare,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Star,
  MessageCircle,
  Target,
  Zap,
  AlertOctagon,
  TrendingUp as TrendUp,
  Users,
  Gauge,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface AnalyticsOverview {
  total_consultas: number
  consultas_contestadas: number
  consultas_no_contestadas: number
  consultas_lenguaje_inapropiado: number
  tasa_exito: number
  tasa_lenguaje_inapropiado: number
  tiempo_respuesta_promedio_ms: number | null
  consultas_hoy: number
  consultas_ayer: number
  consultas_semana: number
  consultas_mes: number
  tendencia_diaria: number
  tendencia_semanal: number
}

interface MonthlyStats {
  mes: string
  mes_nombre: string
  total_consultas: number
  contestadas: number
  no_contestadas: number
  lenguaje_inapropiado: number
  tasa_exito: number
}

interface WeeklyStats {
  semana: number
  fecha_inicio: string
  fecha_fin: string
  total_consultas: number
  contestadas: number
  no_contestadas: number
  lenguaje_inapropiado: number
  tasa_exito: number
}

interface HeatmapData {
  dia: number
  dia_nombre: string
  hora: number
  consultas: number
}

interface HourlyStats {
  hora: number
  consultas: number
}

interface KeywordCount {
  palabra: string
  frecuencia: number
}

interface InappropriateLanguageStats {
  total: number
  porcentaje: number
  ultimas_24h: number
  ultima_semana: number
  tendencia: string
}

interface UnansweredQuestion {
  id: number
  pregunta: string
  fecha: string
  session_id: string | null
}

interface DashboardAnalytics {
  overview: AnalyticsOverview
  activity_by_month: MonthlyStats[]
  activity_by_week: WeeklyStats[]
  heatmap: HeatmapData[]
  hourly_distribution: HourlyStats[]
  inappropriate_language: InappropriateLanguageStats
  top_keywords: KeywordCount[]
}

// Interfaces de Feedback
interface FeedbackStats {
  total_feedback: number
  total_likes: number
  total_dislikes: number
  tasa_satisfaccion: number
  feedback_hoy: number
  feedback_semana: number
  tendencia_diaria: number
}

interface FeedbackByReason {
  motivo: string
  conteo: number
  porcentaje: number
}

interface FeedbackDetail {
  id: number
  interaccion_id: number
  pregunta: string
  respuesta: string
  tipo_feedback: string
  motivo: string | null
  fecha: string
}

interface FeedbackAnalytics {
  stats: FeedbackStats
  by_reason: FeedbackByReason[]
  recent_dislikes: FeedbackDetail[]
}

// Interfaces de Encuestas de Satisfaccion
interface SurveyStats {
  total_encuestas: number
  promedio_calificacion: number
  distribucion: number[]
  encuestas_hoy: number
  encuestas_semana: number
  por_trigger: { gracias: number; inactividad: number; manual: number }
}

interface SurveyKPIs {
  nps: number
  csat: number
  tasa_respuesta: number
  tasa_comentarios: number
  desviacion_std: number
  variacion_diaria: number
  variacion_semanal: number
}

interface TendenciaSemanal {
  semana: string
  fecha_inicio: string
  encuestas: number
  promedio: number
}

interface DistribucionHoraria {
  hora: number
  encuestas: number
}

interface SurveyAnalisis {
  promedio_por_trigger: { gracias: number; inactividad: number; manual: number }
  tendencia_semanal: TendenciaSemanal[]
  distribucion_horaria: DistribucionHoraria[]
}

interface SurveyAlerta {
  id: number
  calificacion: number
  comentario: string | null
  fecha: string
  trigger: string
}

interface SurveyDetail {
  id: number
  session_id: string
  calificacion: number
  comentario: string | null
  trigger: string
  fecha: string
}

interface SurveyAnalytics {
  stats: SurveyStats
  kpis: SurveyKPIs
  analisis: SurveyAnalisis
  alertas: SurveyAlerta[]
  recent_surveys: SurveyDetail[]
  comentarios_recientes: SurveyDetail[]
}

// Componente de Nube de Palabras
function WordCloud({ keywords }: { keywords: KeywordCount[] }) {
  const maxFreq = Math.max(...keywords.map(k => k.frecuencia), 1)

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4">
      {keywords.slice(0, 25).map((keyword, index) => {
        const size = 0.7 + (keyword.frecuencia / maxFreq) * 0.8
        const colors = [
          'text-red-500', 'text-orange-500', 'text-amber-500',
          'text-emerald-500', 'text-blue-500', 'text-violet-500',
          'text-pink-500', 'text-cyan-500'
        ]
        const color = colors[index % colors.length]

        return (
          <span
            key={keyword.palabra}
            className={`${color} font-medium cursor-default hover:opacity-80 transition-opacity`}
            style={{ fontSize: `${size}rem` }}
            title={`${keyword.frecuencia} menciones`}
          >
            {keyword.palabra}
          </span>
        )
      })}
    </div>
  )
}

// Componente de Mapa de Calor
function HeatMap({ data }: { data: HeatmapData[] }) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const maxConsultas = Math.max(...data.map(d => d.consultas), 1)

  const getColor = (consultas: number) => {
    if (consultas === 0) return 'bg-stone-100'
    const intensity = consultas / maxConsultas
    if (intensity < 0.2) return 'bg-orange-100'
    if (intensity < 0.4) return 'bg-orange-200'
    if (intensity < 0.6) return 'bg-orange-300'
    if (intensity < 0.8) return 'bg-orange-400'
    return 'bg-red-500'
  }

  const getDataPoint = (dia: number, hora: number) => {
    return data.find(d => d.dia === dia && d.hora === hora)?.consultas || 0
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-1 mb-1 ml-10">
          {hours.filter((_, i) => i % 3 === 0).map(hour => (
            <div key={hour} className="w-8 text-center text-xs text-stone-400">
              {hour}h
            </div>
          ))}
        </div>
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <div className="w-8 text-xs text-stone-500 font-medium">{day}</div>
            {hours.map(hour => {
              const consultas = getDataPoint(dayIndex, hour)
              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className={`w-3 h-3 rounded-sm ${getColor(consultas)} transition-all hover:scale-125 cursor-default`}
                  title={`${day} ${hour}:00 - ${consultas} consultas`}
                />
              )
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-xs text-stone-400">Menos</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 bg-stone-100 rounded-sm" />
            <div className="w-3 h-3 bg-orange-100 rounded-sm" />
            <div className="w-3 h-3 bg-orange-200 rounded-sm" />
            <div className="w-3 h-3 bg-orange-300 rounded-sm" />
            <div className="w-3 h-3 bg-orange-400 rounded-sm" />
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
          </div>
          <span className="text-xs text-stone-400">Más</span>
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([])
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalytics | null>(null)
  const [surveyAnalytics, setSurveyAnalytics] = useState<SurveyAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [_activeBarIndex, _setActiveBarIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const itemsPerPage = 5

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }

        const [analyticsRes, unansweredRes, feedbackRes, surveyRes] = await Promise.all([
          fetch(`${API_URL}/admin/analytics`, { headers }),
          fetch(`${API_URL}/admin/unanswered?limit=20`, { headers }),
          fetch(`${API_URL}/admin/feedback/analytics`, { headers }),
          fetch(`${API_URL}/admin/survey/analytics`, { headers }),
        ])

        if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
        if (unansweredRes.ok) setUnanswered(await unansweredRes.json())
        if (feedbackRes.ok) setFeedbackAnalytics(await feedbackRes.json())
        if (surveyRes.ok) setSurveyAnalytics(await surveyRes.json())
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Datos para el gráfico de pie
  const pieData = useMemo(() => {
    if (!analytics) return []
    return [
      { name: 'Contestadas', value: analytics.overview.consultas_contestadas, fill: '#10b981' },
      { name: 'Sin Contestar', value: analytics.overview.consultas_no_contestadas, fill: '#f59e0b' },
      { name: 'Lenguaje Inapropiado', value: analytics.overview.consultas_lenguaje_inapropiado, fill: '#ef4444' },
    ].filter(d => d.value > 0)
  }, [analytics])

  // Datos para gráfico de líneas (semanal o mensual)
  const trendData = useMemo(() => {
    if (!analytics) return []
    if (viewMode === 'week') {
      return analytics.activity_by_week.map(w => ({
        name: `S${w.semana}`,
        consultas: w.total_consultas,
        contestadas: w.contestadas,
        noContestadas: w.no_contestadas,
      }))
    }
    return analytics.activity_by_month.map(m => ({
      name: m.mes_nombre.split(' ')[0].substring(0, 3),
      consultas: m.total_consultas,
      contestadas: m.contestadas,
      noContestadas: m.no_contestadas,
    }))
  }, [analytics, viewMode])

  // Datos para gráfico de distribución por hora
  const hourlyData = useMemo(() => {
    if (!analytics) return []
    return analytics.hourly_distribution.map(h => ({
      hora: `${h.hora}h`,
      consultas: h.consultas,
    }))
  }, [analytics])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalPages = Math.ceil(unanswered.length / itemsPerPage)
  const currentUnanswered = unanswered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const overview = analytics?.overview

  return (
    <div className="p-8 space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard Analytics</h1>
          <p className="text-sm text-stone-500">Resumen de actividad del chatbot HeredIA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400" />
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="h-9 w-36 text-sm"
              placeholder="Desde"
            />
            <span className="text-stone-400">-</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="h-9 w-36 text-sm"
              placeholder="Hasta"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards - Primera fila */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-stone-200 bg-white rounded-xl p-5 hover:border-stone-300 transition-all duration-200 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-1">Total Consultas</p>
              <div className="text-2xl font-bold tracking-tight text-stone-900">
                {overview?.total_consultas.toLocaleString() || 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(overview?.tendencia_diaria || 0) >= 0 ? (
              <Badge className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{overview?.tendencia_diaria || 0}% hoy
              </Badge>
            ) : (
              <Badge className="bg-red-50 text-red-600 text-xs px-2 py-0.5 border-0">
                <TrendingDown className="w-3 h-3 mr-1" />
                {overview?.tendencia_diaria || 0}% hoy
              </Badge>
            )}
          </div>
        </Card>

        <Card className="border-stone-200 bg-white rounded-xl p-5 hover:border-stone-300 transition-all duration-200 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-1">Tasa de Éxito</p>
              <div className="text-2xl font-bold tracking-tight text-stone-900">
                {overview?.tasa_exito || 0}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${overview?.tasa_exito || 0}%` }}
            />
          </div>
        </Card>

        <Card className="border-stone-200 bg-white rounded-xl p-5 hover:border-stone-300 transition-all duration-200 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-1">Tiempo Promedio</p>
              <div className="text-2xl font-bold tracking-tight text-stone-900">
                {overview?.tiempo_respuesta_promedio_ms
                  ? `${(overview.tiempo_respuesta_promedio_ms / 1000).toFixed(1)}s`
                  : 'N/A'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <Badge className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 border-0">
            Vertex AI Response
          </Badge>
        </Card>

        <Card className="border-stone-200 bg-white rounded-xl p-5 hover:border-stone-300 transition-all duration-200 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-1">Lenguaje Inapropiado</p>
              <div className="text-2xl font-bold tracking-tight text-red-600">
                {analytics?.inappropriate_language.total || 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <Badge className={`text-xs px-2 py-0.5 border-0 ${
            analytics?.inappropriate_language.tendencia === 'aumentando'
              ? 'bg-red-50 text-red-600'
              : analytics?.inappropriate_language.tendencia === 'disminuyendo'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-stone-100 text-stone-500'
          }`}>
            {analytics?.inappropriate_language.tendencia === 'aumentando' && <TrendingUp className="w-3 h-3 mr-1" />}
            {analytics?.inappropriate_language.tendencia === 'disminuyendo' && <TrendingDown className="w-3 h-3 mr-1" />}
            {analytics?.inappropriate_language.ultima_semana || 0} esta semana
          </Badge>
        </Card>
      </div>

      {/* Segunda fila: Consultas hoy/semana/mes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-stone-200 bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Hoy</p>
              <p className="text-2xl font-bold text-stone-900">{overview?.consultas_hoy || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-stone-200 bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Esta Semana</p>
              <p className="text-2xl font-bold text-stone-900">{overview?.consultas_semana || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-stone-200 bg-gradient-to-br from-violet-50 to-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Este Mes</p>
              <p className="text-2xl font-bold text-stone-900">{overview?.consultas_mes || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seccion de Feedback de Usuarios */}
      {feedbackAnalytics && feedbackAnalytics.stats.total_feedback > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tarjeta de Satisfaccion */}
          <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-semibold text-stone-900 text-base">
                Satisfaccion de Usuarios
              </CardTitle>
              <CardDescription className="text-sm text-stone-400">
                Feedback recibido del chat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-600">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-2xl font-bold">{feedbackAnalytics.stats.total_likes}</span>
                  </div>
                  <p className="text-xs text-stone-400">Me gusta</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-red-500">
                    <ThumbsDown className="w-5 h-5" />
                    <span className="text-2xl font-bold">{feedbackAnalytics.stats.total_dislikes}</span>
                  </div>
                  <p className="text-xs text-stone-400">No me gusta</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-stone-900">
                    {feedbackAnalytics.stats.tasa_satisfaccion}%
                  </span>
                  <p className="text-xs text-stone-400">Satisfaccion</p>
                </div>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all"
                  style={{ width: `${feedbackAnalytics.stats.tasa_satisfaccion}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-stone-400">
                <span>{feedbackAnalytics.stats.feedback_hoy} hoy</span>
                <span>{feedbackAnalytics.stats.feedback_semana} esta semana</span>
              </div>
            </CardContent>
          </Card>

          {/* Motivos de Dislike */}
          <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-semibold text-stone-900 text-base">
                Motivos de Insatisfaccion
              </CardTitle>
              <CardDescription className="text-sm text-stone-400">
                Por que no les gusto la respuesta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackAnalytics.by_reason.length > 0 ? (
                <div className="space-y-3">
                  {feedbackAnalytics.by_reason.slice(0, 4).map((reason, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-stone-600 truncate max-w-[180px]" title={reason.motivo}>
                        {reason.motivo}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-red-400 h-full rounded-full"
                            style={{ width: `${reason.porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-500 w-8 text-right">{reason.conteo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-stone-400 text-sm">
                  Sin motivos registrados
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ultimos Dislikes */}
          <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-semibold text-stone-900 text-base">
                Ultimos Dislikes
              </CardTitle>
              <CardDescription className="text-sm text-stone-400">
                Respuestas que no gustaron
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackAnalytics.recent_dislikes.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {feedbackAnalytics.recent_dislikes.slice(0, 3).map((item) => (
                    <div key={item.id} className="border-l-2 border-red-300 pl-3 py-1">
                      <p className="text-xs font-medium text-stone-700 line-clamp-1">
                        {item.pregunta}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {item.motivo || 'Sin motivo especificado'}
                      </p>
                      <p className="text-xs text-stone-300 mt-0.5">
                        {new Date(item.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-stone-400 text-sm">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  Sin dislikes recientes
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SECCION AVANZADA DE ENCUESTAS DE SATISFACCION */}
      {/* ====================================================================== */}
      {surveyAnalytics && surveyAnalytics.stats.total_encuestas > 0 && (
        <>
          {/* Fila 1: KPIs Principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* NPS Score */}
            <Card className="border-stone-200 bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">NPS Score</p>
                    <p className="text-3xl font-bold text-stone-900 mt-1">
                      {surveyAnalytics.kpis?.nps || 0}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {(surveyAnalytics.kpis?.nps || 0) >= 50 ? 'Excelente' :
                       (surveyAnalytics.kpis?.nps || 0) >= 0 ? 'Bueno' : 'Necesita mejora'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    (surveyAnalytics.kpis?.nps || 0) >= 50 ? 'bg-emerald-100' :
                    (surveyAnalytics.kpis?.nps || 0) >= 0 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Target className={`w-6 h-6 ${
                      (surveyAnalytics.kpis?.nps || 0) >= 50 ? 'text-emerald-600' :
                      (surveyAnalytics.kpis?.nps || 0) >= 0 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CSAT Score */}
            <Card className="border-stone-200 bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">CSAT</p>
                    <p className="text-3xl font-bold text-stone-900 mt-1">
                      {surveyAnalytics.kpis?.csat || 0}%
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Usuarios satisfechos (4-5★)
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-100">
                    <ThumbsUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calificacion Promedio */}
            <Card className="border-stone-200 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Promedio</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-3xl font-bold text-stone-900">
                        {surveyAnalytics.stats.promedio_calificacion}
                      </p>
                      <span className="text-lg text-stone-400">/ 5</span>
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(surveyAnalytics.stats.promedio_calificacion)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-amber-100">
                    <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Encuestas */}
            <Card className="border-stone-200 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Encuestas</p>
                    <p className="text-3xl font-bold text-stone-900 mt-1">
                      {surveyAnalytics.stats.total_encuestas}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {(surveyAnalytics.kpis?.variacion_semanal || 0) >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${
                        (surveyAnalytics.kpis?.variacion_semanal || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {surveyAnalytics.kpis?.variacion_semanal || 0}% vs sem. ant.
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fila 2: Metricas Secundarias */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Tasa de Respuesta */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100">
                    <Zap className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Tasa de Respuesta</p>
                    <p className="text-xl font-bold text-stone-900">{surveyAnalytics.kpis?.tasa_respuesta || 0}%</p>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Encuestas completadas vs interacciones totales
                </p>
              </CardContent>
            </Card>

            {/* Tasa de Comentarios */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <MessageCircle className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Con Comentarios</p>
                    <p className="text-xl font-bold text-stone-900">{surveyAnalytics.kpis?.tasa_comentarios || 0}%</p>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Usuarios que dejaron feedback escrito
                </p>
              </CardContent>
            </Card>

            {/* Consistencia (Desv. Estandar) */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Gauge className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Consistencia (σ)</p>
                    <p className="text-xl font-bold text-stone-900">{surveyAnalytics.kpis?.desviacion_std || 0}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  {(surveyAnalytics.kpis?.desviacion_std || 0) < 1 ? 'Alta consistencia' :
                   (surveyAnalytics.kpis?.desviacion_std || 0) < 1.5 ? 'Consistencia moderada' : 'Alta variabilidad'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fila 3: Graficos y Analisis */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tendencia Semanal */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="font-semibold text-stone-900">
                  Tendencia de Satisfaccion
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Ultimas 4 semanas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {surveyAnalytics.analisis?.tendencia_semanal && surveyAnalytics.analisis.tendencia_semanal.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={surveyAnalytics.analisis.tendencia_semanal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        formatter={(value: number, name: string) => [
                          name === 'promedio' ? `${value} ★` : value,
                          name === 'promedio' ? 'Promedio' : 'Encuestas'
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="promedio"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', r: 5 }}
                        name="Promedio"
                      />
                      <Line
                        type="monotone"
                        dataKey="encuestas"
                        stroke="#6366f1"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#6366f1', r: 4 }}
                        name="Encuestas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-stone-400">
                    Sin datos suficientes
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribucion por Estrellas (Mejorado) */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="font-semibold text-stone-900">
                  Distribucion de Calificaciones
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Desglose por estrellas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[5, 4, 3, 2, 1].map((stars) => ({
                      estrellas: `${stars}★`,
                      cantidad: surveyAnalytics.stats.distribucion[stars - 1] || 0,
                      fill: stars >= 4 ? '#10b981' : stars === 3 ? '#f59e0b' : '#ef4444'
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="estrellas" type="category" tick={{ fontSize: 12 }} width={40} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                      formatter={(value: number) => [`${value} encuestas`, 'Cantidad']}
                    />
                    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                      {[5, 4, 3, 2, 1].map((stars, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={stars >= 4 ? '#10b981' : stars === 3 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Fila 4: Promedio por Trigger y Alertas */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Promedio por Trigger */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-semibold text-stone-900 text-base">
                  Calificacion por Origen
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Segun como se disparo la encuesta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'gracias', label: 'Agradecimiento', icon: '🙏', color: 'emerald' },
                    { key: 'inactividad', label: 'Inactividad', icon: '⏰', color: 'amber' },
                    { key: 'manual', label: 'Manual', icon: '👆', color: 'blue' }
                  ].map(({ key, label, icon, color }) => {
                    const promedio = surveyAnalytics.analisis?.promedio_por_trigger?.[key as keyof typeof surveyAnalytics.analisis.promedio_por_trigger] || 0
                    const count = surveyAnalytics.stats.por_trigger[key as keyof typeof surveyAnalytics.stats.por_trigger] || 0
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <div>
                            <p className="text-sm font-medium text-stone-700">{label}</p>
                            <p className="text-xs text-stone-400">{count} encuestas</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-stone-900">{promedio}</span>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Alertas - Calificaciones Bajas */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-semibold text-stone-900 text-base flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  Alertas Recientes
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Calificaciones de 1-2 estrellas (7 dias)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {surveyAnalytics.alertas && surveyAnalytics.alertas.length > 0 ? (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto">
                    {surveyAnalytics.alertas.slice(0, 4).map((alerta) => (
                      <div key={alerta.id} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= alerta.calificacion
                                  ? 'text-red-400 fill-red-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-600 line-clamp-2">
                            {alerta.comentario || 'Sin comentario'}
                          </p>
                          <p className="text-xs text-stone-400 mt-1">
                            {new Date(alerta.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-stone-400 text-sm">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                    Sin alertas recientes
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comentarios Recientes */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-semibold text-stone-900 text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comentarios Recientes
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Opiniones de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {surveyAnalytics.comentarios_recientes.length > 0 ? (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto">
                    {surveyAnalytics.comentarios_recientes.slice(0, 3).map((item) => (
                      <div key={item.id} className="border-l-2 border-amber-300 pl-3 py-1">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= item.calificacion
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-2">
                          "{item.comentario}"
                        </p>
                        <p className="text-xs text-stone-300 mt-0.5">
                          {new Date(item.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-stone-400 text-sm">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    Sin comentarios aun
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fila 5: Insights Automaticos */}
          <Card className="border-stone-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="font-semibold text-stone-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Insights Automaticos
              </CardTitle>
              <CardDescription className="text-sm text-stone-500">
                Analisis inteligente basado en los datos de satisfaccion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Insight 1: Estado General */}
                <div className={`p-4 rounded-lg border ${
                  (surveyAnalytics.kpis?.nps || 0) >= 50
                    ? 'bg-emerald-50 border-emerald-200'
                    : (surveyAnalytics.kpis?.nps || 0) >= 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      (surveyAnalytics.kpis?.nps || 0) >= 50
                        ? 'bg-emerald-100'
                        : (surveyAnalytics.kpis?.nps || 0) >= 0
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                    }`}>
                      {(surveyAnalytics.kpis?.nps || 0) >= 50 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (surveyAnalytics.kpis?.nps || 0) >= 0 ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <AlertOctagon className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800">Estado General</h4>
                      <p className="text-xs text-stone-600 mt-1">
                        {(surveyAnalytics.kpis?.nps || 0) >= 50
                          ? 'Excelente satisfaccion. Los usuarios estan muy contentos con el servicio.'
                          : (surveyAnalytics.kpis?.nps || 0) >= 0
                          ? 'Satisfaccion aceptable, pero hay oportunidades de mejora.'
                          : 'Atencion requerida. La satisfaccion esta por debajo del promedio esperado.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insight 2: Tendencia */}
                <div className={`p-4 rounded-lg border ${
                  (surveyAnalytics.kpis?.variacion_semanal || 0) >= 10
                    ? 'bg-emerald-50 border-emerald-200'
                    : (surveyAnalytics.kpis?.variacion_semanal || 0) >= -10
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      (surveyAnalytics.kpis?.variacion_semanal || 0) >= 10
                        ? 'bg-emerald-100'
                        : (surveyAnalytics.kpis?.variacion_semanal || 0) >= -10
                        ? 'bg-blue-100'
                        : 'bg-orange-100'
                    }`}>
                      {(surveyAnalytics.kpis?.variacion_semanal || 0) >= 0 ? (
                        <TrendUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800">Tendencia Semanal</h4>
                      <p className="text-xs text-stone-600 mt-1">
                        {(surveyAnalytics.kpis?.variacion_semanal || 0) >= 10
                          ? `Crecimiento del ${surveyAnalytics.kpis?.variacion_semanal}% en participacion respecto a la semana anterior.`
                          : (surveyAnalytics.kpis?.variacion_semanal || 0) >= -10
                          ? 'La participacion se mantiene estable respecto a la semana pasada.'
                          : `Disminucion del ${Math.abs(surveyAnalytics.kpis?.variacion_semanal || 0)}% en participacion. Considerar incentivar feedback.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insight 3: Mejor Trigger */}
                {surveyAnalytics.analisis?.promedio_por_trigger && (
                  <div className="p-4 rounded-lg border bg-violet-50 border-violet-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-violet-100">
                        <Target className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-800">Mejor Momento</h4>
                        <p className="text-xs text-stone-600 mt-1">
                          {(() => {
                            const triggers = surveyAnalytics.analisis?.promedio_por_trigger || { gracias: 0, inactividad: 0, manual: 0 }
                            const mejor = Object.entries(triggers).reduce((a, b) => a[1] > b[1] ? a : b)
                            const nombres: Record<string, string> = { gracias: 'agradecimiento', inactividad: 'inactividad', manual: 'solicitud manual' }
                            return `Las encuestas por ${nombres[mejor[0]] || mejor[0]} tienen la mejor calificacion (${mejor[1]}★). Optimizar este trigger.`
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insight 4: Consistencia */}
                <div className={`p-4 rounded-lg border ${
                  (surveyAnalytics.kpis?.desviacion_std || 0) < 1
                    ? 'bg-emerald-50 border-emerald-200'
                    : (surveyAnalytics.kpis?.desviacion_std || 0) < 1.5
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      (surveyAnalytics.kpis?.desviacion_std || 0) < 1
                        ? 'bg-emerald-100'
                        : (surveyAnalytics.kpis?.desviacion_std || 0) < 1.5
                        ? 'bg-yellow-100'
                        : 'bg-orange-100'
                    }`}>
                      <Gauge className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800">Consistencia</h4>
                      <p className="text-xs text-stone-600 mt-1">
                        {(surveyAnalytics.kpis?.desviacion_std || 0) < 1
                          ? 'Alta consistencia en calificaciones. La experiencia es uniforme para todos los usuarios.'
                          : (surveyAnalytics.kpis?.desviacion_std || 0) < 1.5
                          ? 'Consistencia moderada. Algunas experiencias varian significativamente.'
                          : 'Alta variabilidad. La experiencia difiere mucho entre usuarios. Investigar causas.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insight 5: Engagement */}
                <div className={`p-4 rounded-lg border ${
                  (surveyAnalytics.kpis?.tasa_comentarios || 0) >= 30
                    ? 'bg-emerald-50 border-emerald-200'
                    : (surveyAnalytics.kpis?.tasa_comentarios || 0) >= 15
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      (surveyAnalytics.kpis?.tasa_comentarios || 0) >= 30
                        ? 'bg-emerald-100'
                        : (surveyAnalytics.kpis?.tasa_comentarios || 0) >= 15
                        ? 'bg-blue-100'
                        : 'bg-stone-100'
                    }`}>
                      <MessageCircle className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800">Engagement</h4>
                      <p className="text-xs text-stone-600 mt-1">
                        {(surveyAnalytics.kpis?.tasa_comentarios || 0) >= 30
                          ? 'Alto engagement. Los usuarios estan muy dispuestos a dar feedback detallado.'
                          : (surveyAnalytics.kpis?.tasa_comentarios || 0) >= 15
                          ? 'Engagement moderado. Considera incentivar comentarios mas detallados.'
                          : 'Bajo engagement en comentarios. Los usuarios califican pero no comentan.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insight 6: Alertas */}
                <div className={`p-4 rounded-lg border ${
                  (surveyAnalytics.alertas?.length || 0) === 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : (surveyAnalytics.alertas?.length || 0) <= 2
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      (surveyAnalytics.alertas?.length || 0) === 0
                        ? 'bg-emerald-100'
                        : (surveyAnalytics.alertas?.length || 0) <= 2
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                    }`}>
                      <AlertOctagon className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800">Alertas Criticas</h4>
                      <p className="text-xs text-stone-600 mt-1">
                        {(surveyAnalytics.alertas?.length || 0) === 0
                          ? 'Sin calificaciones bajas en los ultimos 7 dias. Excelente desempeno!'
                          : (surveyAnalytics.alertas?.length || 0) <= 2
                          ? `${surveyAnalytics.alertas?.length} calificaciones bajas esta semana. Revisar comentarios para mejoras.`
                          : `${surveyAnalytics.alertas?.length} calificaciones bajas esta semana. Atencion prioritaria requerida.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Gráficos - Primera fila */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Pie - Distribución de consultas */}
        <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-stone-900">
              Distribución de Consultas
            </CardTitle>
            <CardDescription className="text-sm text-stone-400">
              Estado de las consultas totales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} consultas`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Tendencia */}
        <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-semibold text-stone-900">
                  Tendencia de Actividad
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Evolución de consultas
                </CardDescription>
              </div>
              <Select value={viewMode} onValueChange={(v: 'week' | 'month') => setViewMode(v)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="month">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200" />
                  <XAxis dataKey="name" className="text-xs text-stone-400" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs text-stone-400" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="consultas" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Total" />
                  <Line type="monotone" dataKey="contestadas" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Contestadas" />
                  <Line type="monotone" dataKey="noContestadas" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Sin Contestar" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Segunda fila */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mapa de Calor */}
        <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-stone-900">
              Mapa de Calor
            </CardTitle>
            <CardDescription className="text-sm text-stone-400">
              Actividad por día y hora (últimos 30 días)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.heatmap && <HeatMap data={analytics.heatmap} />}
          </CardContent>
        </Card>

        {/* Distribución por hora */}
        <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-stone-900">
              Distribución por Hora
            </CardTitle>
            <CardDescription className="text-sm text-stone-400">
              Horarios de mayor actividad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} maxBarSize={20}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200" vertical={false} />
                  <XAxis
                    dataKey="hora"
                    className="text-xs text-stone-400"
                    tickLine={false}
                    axisLine={false}
                    interval={2}
                  />
                  <YAxis className="text-xs text-stone-400" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} consultas`, '']}
                  />
                  <Bar dataKey="consultas" fill="url(#hourlyGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nube de Palabras Clave */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-stone-900">
            Palabras Clave Frecuentes
          </CardTitle>
          <CardDescription className="text-sm text-stone-400">
            Términos más utilizados en las consultas (últimos 30 días)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.top_keywords && <WordCloud keywords={analytics.top_keywords} />}
        </CardContent>
      </Card>

      {/* Preguntas sin respuesta */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="font-semibold text-stone-900">
                Preguntas Sin Respuesta
              </CardTitle>
              <Badge className="bg-amber-50 text-amber-600 text-xs px-2 py-1 border-0">
                <HelpCircle className="w-3 h-3 mr-1" />
                {unanswered.length} pendientes
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unanswered.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p>¡Excelente! No hay preguntas sin respuesta</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-200 hover:bg-transparent">
                    <TableHead className="text-stone-500 font-semibold">Pregunta</TableHead>
                    <TableHead className="text-stone-500 font-semibold w-24">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUnanswered.map((item) => (
                    <TableRow key={item.id} className="border-stone-200 hover:bg-stone-50 transition-colors">
                      <TableCell className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-stone-700 line-clamp-2">
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
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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
