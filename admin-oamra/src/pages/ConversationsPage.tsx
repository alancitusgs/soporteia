import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import {
  Search,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowUpDown,
  ExternalLink,
  Calendar,
  Tag,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type {
  ConversationLog,
  ExtendedStats,
  DailyStats,
  HourlyStats,
  TopQuestion,
  KeywordCount,
  SimilarQuestionGroup,
  PaginatedConversations,
} from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function ConversationsPage() {
  const { token } = useAuth()

  // Estados principales
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Stats y datos
  const [stats, setStats] = useState<ExtendedStats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([])
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([])
  const [keywords, setKeywords] = useState<KeywordCount[]>([])
  const [similarGroups, setSimilarGroups] = useState<SimilarQuestionGroup[]>([])

  // Tabla y paginación
  const [conversations, setConversations] = useState<ConversationLog[]>([])
  const [totalConversations, setTotalConversations] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 15

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('fecha')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Modal
  const [selectedConversation, setSelectedConversation] = useState<ConversationLog | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  // Fetch stats y gráficos
  const fetchDashboardData = useCallback(async () => {
    try {
      const [
        statsRes,
        dailyRes,
        hourlyRes,
        topRes,
        keywordsRes,
        similarRes,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/stats/extended`, { headers }),
        fetch(`${API_URL}/admin/stats/daily?days=30`, { headers }),
        fetch(`${API_URL}/admin/stats/hourly`, { headers }),
        fetch(`${API_URL}/admin/stats/top-questions?limit=10`, { headers }),
        fetch(`${API_URL}/admin/stats/keywords?limit=20`, { headers }),
        fetch(`${API_URL}/admin/stats/similar-unanswered?limit=10`, { headers }),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (dailyRes.ok) setDailyStats(await dailyRes.json())
      if (hourlyRes.ok) setHourlyStats(await hourlyRes.json())
      if (topRes.ok) setTopQuestions(await topRes.json())
      if (keywordsRes.ok) setKeywords(await keywordsRes.json())
      if (similarRes.ok) setSimilarGroups(await similarRes.json())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    }
  }, [token])

  // Fetch conversaciones con filtros
  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        skip: String((currentPage - 1) * itemsPerPage),
        limit: String(itemsPerPage),
        sort_by: sortBy,
        sort_order: sortOrder,
      })

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('estado', statusFilter)
      if (dateFrom) params.append('fecha_inicio', dateFrom)
      if (dateTo) params.append('fecha_fin', dateTo)

      const res = await fetch(`${API_URL}/admin/conversations/filtered?${params}`, { headers })

      if (res.ok) {
        const data: PaginatedConversations = await res.json()
        setConversations(data.items)
        setTotalConversations(data.total)
        setTotalPages(data.pages)
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }, [token, currentPage, searchQuery, statusFilter, dateFrom, dateTo, sortBy, sortOrder])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchDashboardData(), fetchConversations()])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [currentPage, searchQuery, statusFilter, dateFrom, dateTo, sortBy, sortOrder])

  // Exportar CSV
  const handleExport = () => {
    const params = new URLSearchParams()
    if (dateFrom) params.append('fecha_inicio', dateFrom)
    if (dateTo) params.append('fecha_fin', dateTo)
    if (statusFilter !== 'all') params.append('estado', statusFilter)

    const url = `${API_URL}/admin/conversations/export?${params}`
    window.open(url, '_blank')
  }

  // Toggle orden
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  // Aplicar filtros
  const applyFilters = () => {
    setCurrentPage(1)
    fetchConversations()
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Preparar datos para gráficos
  const dailyChartData = dailyStats.map((d) => ({
    fecha: new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    consultas: d.consultas,
  }))

  const hourlyChartData = hourlyStats.map((h) => ({
    hora: `${h.hora}:00`,
    consultas: h.consultas,
  }))

  const pieData = stats ? [
    { name: 'Contestadas', value: stats.consultas_contestadas, color: '#10b981' },
    { name: 'Sin contestar', value: stats.consultas_no_contestadas, color: '#ef4444' },
  ] : []

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Logs de Conversaciones</h1>
          <p className="text-sm text-stone-500 mt-1">
            Análisis completo de interacciones con el chatbot Tano
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-stone-100 p-1 rounded-lg">
          <TabsTrigger value="dashboard" className="rounded-md data-[state=active]:bg-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-md data-[state=active]:bg-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="analysis" className="rounded-md data-[state=active]:bg-white">
            <Tag className="w-4 h-4 mr-2" />
            Análisis
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Tiempo promedio */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Tiempo Promedio</p>
                    <p className="text-2xl font-semibold text-stone-900 mt-1">
                      {stats?.tiempo_respuesta_promedio_ms
                        ? `${(stats.tiempo_respuesta_promedio_ms / 1000).toFixed(1)}s`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-violet-50 rounded-lg">
                    <Clock className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasa de resolución */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Tasa de Resolución</p>
                    <p className="text-2xl font-semibold text-stone-900 mt-1">
                      {stats?.tasa_resolucion?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${stats?.tasa_resolucion || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Consultas hoy */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Consultas Hoy</p>
                    <p className="text-2xl font-semibold text-stone-900 mt-1">
                      {stats?.consultas_hoy || 0}
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {(stats?.tendencia_hoy_vs_ayer || 0) >= 0 ? (
                    <Badge className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 border-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{stats?.tendencia_hoy_vs_ayer?.toFixed(0) || 0}% vs ayer
                    </Badge>
                  ) : (
                    <Badge className="bg-red-50 text-red-600 text-xs px-2 py-0.5 border-0">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {stats?.tendencia_hoy_vs_ayer?.toFixed(0) || 0}% vs ayer
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sin contestar */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Sin Contestar</p>
                    <p className="text-2xl font-semibold text-stone-900 mt-1">
                      {stats?.consultas_no_contestadas || 0}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  de {stats?.total_consultas || 0} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Línea: Consultas por día */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-stone-900">
                  Consultas por Día
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Últimos 30 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200" vertical={false} />
                      <XAxis
                        dataKey="fecha"
                        className="text-xs text-stone-400"
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis className="text-xs text-stone-400" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="consultas"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Barras: Distribución por hora */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-stone-900">
                  Distribución por Hora
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Actividad según hora del día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyChartData}>
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
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="consultas" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Dona: Contestadas vs Sin contestar */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-stone-900">
                  Estado de Consultas
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Proporción contestadas vs sin contestar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] flex items-center justify-center">
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
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top 10 preguntas */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-stone-900">
                  Top 10 Preguntas Frecuentes
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Últimos 30 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                  {topQuestions.map((q, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-600">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-700 truncate">{q.pregunta}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-stone-400">{q.conteo} veces</span>
                          <Badge className={
                            q.es_no_contestada
                              ? 'bg-red-50 text-red-600 text-xs px-1.5 py-0 border-0'
                              : 'bg-emerald-50 text-emerald-600 text-xs px-1.5 py-0 border-0'
                          }>
                            {q.es_no_contestada ? 'Sin contestar' : 'Contestada'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Historial Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filtros */}
          <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    placeholder="Buscar por pregunta o respuesta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="pl-9 bg-stone-50 border-stone-200"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-stone-50 border-stone-200">
                    <Filter className="w-4 h-4 mr-2 text-stone-400" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="contestada">Contestadas</SelectItem>
                    <SelectItem value="sin_contestar">Sin contestar</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[140px] bg-stone-50 border-stone-200"
                  />
                  <span className="text-stone-400">-</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[140px] bg-stone-50 border-stone-200"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-stone-200 hover:bg-stone-50"
                >
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla */}
          <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-semibold text-stone-900">
                    Historial de Conversaciones
                  </CardTitle>
                  <CardDescription className="text-sm text-stone-400 mt-1">
                    {totalConversations} conversaciones encontradas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-200 hover:bg-transparent">
                    <TableHead
                      className="text-stone-500 font-semibold cursor-pointer hover:text-stone-700"
                      onClick={() => toggleSort('pregunta_usuario')}
                    >
                      <div className="flex items-center gap-1">
                        Pregunta
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-stone-500 font-semibold cursor-pointer hover:text-stone-700"
                      onClick={() => toggleSort('fecha')}
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-stone-500 font-semibold cursor-pointer hover:text-stone-700"
                      onClick={() => toggleSort('tiempo_respuesta_ms')}
                    >
                      <div className="flex items-center gap-1">
                        Tiempo
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-stone-500 font-semibold">Estado</TableHead>
                    <TableHead className="text-stone-500 font-semibold w-[80px]">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((conv) => (
                    <TableRow
                      key={conv.id}
                      className="border-stone-200 hover:bg-stone-50 transition-colors"
                    >
                      <TableCell className="text-sm text-stone-700 max-w-md">
                        <span className="line-clamp-2">{conv.pregunta_usuario}</span>
                      </TableCell>
                      <TableCell className="text-sm text-stone-400 whitespace-nowrap">
                        {new Date(conv.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-stone-600 whitespace-nowrap">
                        {conv.tiempo_respuesta_ms
                          ? `${(conv.tiempo_respuesta_ms / 1000).toFixed(1)}s`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            conv.es_no_contestada
                              ? 'bg-red-50 text-red-600 border-0 text-xs px-2 py-0.5'
                              : 'bg-emerald-50 text-emerald-600 border-0 text-xs px-2 py-0.5'
                          }
                        >
                          {conv.es_no_contestada ? 'Sin contestar' : 'Contestada'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedConversation(conv)
                            setModalOpen(true)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="w-4 h-4 text-stone-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                  <p className="text-sm text-stone-500">
                    Página {currentPage} de {totalPages} ({totalConversations} registros)
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

                    {/* Mostrar números de página */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg'
                              : 'border-stone-200 hover:bg-stone-50 rounded-lg bg-transparent'
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análisis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Palabras clave */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-stone-900">
                  Palabras Clave Frecuentes
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Términos más usados en las consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-50 text-blue-700 border-0 text-sm px-3 py-1"
                      style={{
                        fontSize: `${Math.max(12, Math.min(18, 10 + (kw.frecuencia / keywords[0]?.frecuencia || 1) * 8))}px`,
                      }}
                    >
                      {kw.palabra}
                      <span className="ml-1 text-blue-400">({kw.frecuencia})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preguntas sin contestar agrupadas */}
            <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-base font-semibold text-stone-900">
                    Preguntas Sin Contestar Agrupadas
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-stone-400">
                  Temas recurrentes que necesitan atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {similarGroups.length === 0 ? (
                    <p className="text-sm text-stone-500 text-center py-4">
                      No hay grupos de preguntas similares sin contestar
                    </p>
                  ) : (
                    similarGroups.map((group, index) => (
                      <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-stone-800">
                            {group.pregunta_representativa}
                          </p>
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                            {group.conteo} similares
                          </Badge>
                        </div>
                        {group.preguntas.length > 1 && (
                          <div className="mt-2 space-y-1">
                            {group.preguntas.slice(1, 4).map((p, i) => (
                              <p key={i} className="text-xs text-stone-500 pl-2 border-l-2 border-amber-200">
                                {p}
                              </p>
                            ))}
                            {group.preguntas.length > 4 && (
                              <p className="text-xs text-stone-400 pl-2">
                                + {group.preguntas.length - 4} más...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalle */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Detalle de Conversación
            </DialogTitle>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-4 mt-4">
              {/* Metadata */}
              <div className="flex flex-wrap gap-3 pb-4 border-b border-stone-200">
                <Badge className="bg-stone-100 text-stone-600 border-0">
                  ID: {selectedConversation.id}
                </Badge>
                <Badge className="bg-stone-100 text-stone-600 border-0">
                  {new Date(selectedConversation.fecha).toLocaleString('es-ES')}
                </Badge>
                {selectedConversation.tiempo_respuesta_ms && (
                  <Badge className="bg-violet-50 text-violet-600 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {(selectedConversation.tiempo_respuesta_ms / 1000).toFixed(2)}s
                  </Badge>
                )}
                <Badge
                  className={
                    selectedConversation.es_no_contestada
                      ? 'bg-red-50 text-red-600 border-0'
                      : 'bg-emerald-50 text-emerald-600 border-0'
                  }
                >
                  {selectedConversation.es_no_contestada ? 'Sin contestar' : 'Contestada'}
                </Badge>
              </div>

              {/* Pregunta */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-500">Pregunta del usuario:</p>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-stone-800">{selectedConversation.pregunta_usuario}</p>
                </div>
              </div>

              {/* Respuesta */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-500">Respuesta de Tano:</p>
                <div className="p-4 bg-stone-50 rounded-lg">
                  <p className="text-sm text-stone-800 whitespace-pre-wrap">
                    {selectedConversation.respuesta_tano}
                  </p>
                </div>
              </div>

              {/* Fuentes */}
              {selectedConversation.fuentes && selectedConversation.fuentes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-stone-500">Fuentes consultadas:</p>
                  <div className="space-y-2">
                    {selectedConversation.fuentes.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                        <ExternalLink className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-emerald-700 truncate">
                          {typeof f === 'object' && f !== null && 'title' in f ? f.title : String(f)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session ID */}
              {selectedConversation.session_id && (
                <div className="pt-4 border-t border-stone-200">
                  <p className="text-xs text-stone-400">
                    Session ID: {selectedConversation.session_id}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
