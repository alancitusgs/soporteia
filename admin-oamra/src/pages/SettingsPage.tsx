import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings, Bot, Bell, Save, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/hooks/use-toast'
import type { SystemConfig } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TEMPERATURA_OPTIONS = [
  { value: '0.3', label: '0.3 - Preciso', description: 'Respuestas mas conservadoras y predecibles' },
  { value: '0.5', label: '0.5 - Balanceado', description: 'Balance entre precision y creatividad' },
  { value: '0.7', label: '0.7 - Creativo', description: 'Respuestas mas variadas y naturales' },
  { value: '1.0', label: '1.0 - Muy Creativo', description: 'Maxima variabilidad en respuestas' },
]

const UMBRAL_OPTIONS = [
  { value: '1', label: '1 pregunta' },
  { value: '3', label: '3 preguntas' },
  { value: '5', label: '5 preguntas' },
  { value: '10', label: '10 preguntas' },
]

export function SettingsPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SystemConfig | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    mensaje_bienvenida: '',
    temperatura: '0.7',
    max_tokens: 2000,
    auto_reindexacion: true,
    notificaciones_email: false,
    notificaciones_slack: false,
    umbral_alertas: 3,
  })

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/config`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
        setFormData({
          mensaje_bienvenida: data.mensaje_bienvenida,
          temperatura: data.temperatura,
          max_tokens: data.max_tokens,
          auto_reindexacion: data.auto_reindexacion,
          notificaciones_email: data.notificaciones_email,
          notificaciones_slack: data.notificaciones_slack,
          umbral_alertas: data.umbral_alertas,
        })
      }
    } catch (err) {
      console.error('Error fetching config:', err)
      toast({
        variant: 'destructive',
        title: 'Error al cargar configuracion',
        description: 'No se pudo obtener la configuracion del sistema',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/admin/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Error al guardar configuracion')
      }

      const updatedConfig = await res.json()
      setConfig(updatedConfig)
      toast({
        variant: 'success',
        title: 'Configuracion guardada',
        description: 'Los cambios se han aplicado correctamente.',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: err instanceof Error ? err.message : 'Ocurrio un error inesperado',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (config) {
      setFormData({
        mensaje_bienvenida: config.mensaje_bienvenida,
        temperatura: config.temperatura,
        max_tokens: config.max_tokens,
        auto_reindexacion: config.auto_reindexacion,
        notificaciones_email: config.notificaciones_email,
        notificaciones_slack: config.notificaciones_slack,
        umbral_alertas: config.umbral_alertas,
      })
      toast({
        title: 'Cambios descartados',
        description: 'Se restauraron los valores guardados.',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Configuracion del Sistema</h1>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
            Administra los parametros del chatbot y las notificaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 border-stone-200 hover:bg-stone-50 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Descartar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-lg hover:from-red-600 hover:to-orange-500 transition-all duration-200 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Chatbot Config */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="font-semibold text-stone-900">Configuracion del Chatbot</CardTitle>
              <CardDescription className="text-sm text-stone-400 mt-1">
                Personaliza el comportamiento y respuestas de Tano
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mensaje" className="text-sm font-medium text-stone-700">
              Mensaje de Bienvenida
            </Label>
            <Textarea
              id="mensaje"
              placeholder="Escribe el mensaje de bienvenida..."
              value={formData.mensaje_bienvenida}
              onChange={(e) => setFormData({ ...formData, mensaje_bienvenida: e.target.value })}
              className="min-h-[100px]"
            />
            <p className="text-xs text-stone-400">
              Este mensaje se muestra cuando el usuario saluda al chatbot
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="temperatura" className="text-sm font-medium text-stone-700">
                Temperatura (Creatividad)
              </Label>
              <Select
                value={formData.temperatura}
                onValueChange={(value) => setFormData({ ...formData, temperatura: value })}
              >
                <SelectTrigger className="bg-stone-50 border-stone-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-stone-200 rounded-lg">
                  {TEMPERATURA_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-md">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-400">
                {TEMPERATURA_OPTIONS.find((t) => t.value === formData.temperatura)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_tokens" className="text-sm font-medium text-stone-700">
                Maximo de Tokens
              </Label>
              <Input
                id="max_tokens"
                type="number"
                min={100}
                max={4000}
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) || 2000 })}
                className="bg-stone-50 border-stone-200 focus-visible:ring-stone-300 rounded-lg"
              />
              <p className="text-xs text-stone-400">
                Longitud maxima de respuesta (100-4000)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <p className="text-sm font-medium text-stone-700">Auto-Reindexacion</p>
              <p className="text-xs text-stone-400 mt-1">
                Reindexar documentos automaticamente al subirlos
              </p>
            </div>
            <Switch
              checked={formData.auto_reindexacion}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_reindexacion: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Config */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="font-semibold text-stone-900">Notificaciones</CardTitle>
              <CardDescription className="text-sm text-stone-400 mt-1">
                Configura como deseas recibir alertas y notificaciones
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <p className="text-sm font-medium text-stone-700">Notificaciones por Email</p>
              <p className="text-xs text-stone-400 mt-1">
                Recibe alertas de preguntas sin respuesta por correo
              </p>
            </div>
            <Switch
              checked={formData.notificaciones_email}
              onCheckedChange={(checked) => setFormData({ ...formData, notificaciones_email: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <p className="text-sm font-medium text-stone-700">Notificaciones en Slack</p>
              <p className="text-xs text-stone-400 mt-1">
                Integracion con Slack para alertas en tiempo real
              </p>
            </div>
            <Switch
              checked={formData.notificaciones_slack}
              onCheckedChange={(checked) => setFormData({ ...formData, notificaciones_slack: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="umbral" className="text-sm font-medium text-stone-700">
              Umbral de Alertas (preguntas sin respuesta)
            </Label>
            <Select
              value={formData.umbral_alertas.toString()}
              onValueChange={(value) => setFormData({ ...formData, umbral_alertas: parseInt(value) })}
            >
              <SelectTrigger className="bg-stone-50 border-stone-200 rounded-lg w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 rounded-lg">
                {UMBRAL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="rounded-md">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-stone-400">
              Numero de preguntas sin respuesta antes de enviar alerta
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-stone-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-lg">
              <Settings className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="font-semibold text-stone-900">Informacion del Sistema</CardTitle>
              <CardDescription className="text-sm text-stone-400 mt-1">
                Datos tecnicos del sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-400">Ultima actualizacion</p>
              <p className="text-sm font-medium text-stone-700 mt-1">
                {config?.fecha_actualizacion
                  ? new Date(config.fecha_actualizacion).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Nunca'}
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-400">Version del Sistema</p>
              <p className="text-sm font-medium text-stone-700 mt-1">
                HeredIA v1.0.0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
