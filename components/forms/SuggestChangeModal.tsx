'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SuggestChangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clubId: string
  clubName: string
}

const REQUEST_TYPES = [
  { value: 'info_change', label: 'Cambio de información', description: 'Horarios, descripción, dirección' },
  { value: 'social_update', label: 'Redes sociales', description: 'Actualizar Instagram o Facebook' },
  { value: 'sports_change', label: 'Cambio de deportes', description: 'Agregar o quitar deportes' },
  { value: 'club_closed', label: 'Club cerrado', description: 'El club ya no existe' },
  { value: 'remove_profile', label: 'Eliminar perfil', description: 'Solicitud del dueño del club' },
  { value: 'other', label: 'Otro', description: 'Otro motivo' },
]

export function SuggestChangeModal({ open, onOpenChange, clubId, clubName }: SuggestChangeModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    type: 'info_change',
    description: '',
    contactEmail: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const honeypot = (document.getElementById('website') as HTMLInputElement)?.value
    if (honeypot) {
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setFormData({ type: 'info_change', description: '', contactEmail: '' })
      }, 2000)
      setLoading(false)
      return
    }

    if (!formData.contactEmail || !formData.description) {
      setError('Todos los campos son obligatorios')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.contactEmail)) {
      setError('Por favor ingresa un correo electrónico válido')
      setLoading(false)
      return
    }

    if (formData.description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres')
      setLoading(false)
      return
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const res = await fetch(`${baseUrl}/rest/v1/update_requests`, {
        method: 'POST',
        headers: {
          'apikey': anonKey!,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          club_id: clubId,
          type: formData.type,
          description: formData.description,
          contact_email: formData.contactEmail,
          status: 'pending'
        })
      })

      if (!res.ok) {
        throw new Error('Error al enviar la solicitud')
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setFormData({ type: 'info_change', description: '', contactEmail: '' })
      }, 2000)
    } catch {
      setError('Error al enviar la solicitud. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sugerir cambio</DialogTitle>
          <DialogDescription>
            Todos los campos son obligatorios. Ayúdanos a mantener la información de <strong>{clubName}</strong> actualizada
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">¡Gracias! Tu solicitud ha sido enviada</p>
            <p className="text-sm text-slate-500 mt-1">El administrador la revisará pronto</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de cambio <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {REQUEST_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción del cambio <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe qué información está incorrecta o qué cambios sugieres..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                  minLength={10}
                />
                <p className="text-xs text-slate-500 mt-1">Mínimo 10 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tu correo electrónico <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="Para contactarte si necesitamos más información"
                  required
                />
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              <span className="text-red-500">*</span> Todos los campos son obligatorios
            </p>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
