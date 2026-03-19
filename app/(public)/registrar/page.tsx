'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { validateAndNormalizeSocialUrl } from '@/lib/utils/string-utils'

interface Sport {
  id: number
  name: string
  slug: string
}

interface FormData {
  name: string
  description: string
  region_id: string
  commune_id: string
  instagram_url: string
  facebook_url: string
  contact_email: string
  sports: number[]
  primary_sport: number | null
}

interface FormErrors {
  name?: string
  description?: string
  region_id?: string
  commune_id?: string
  contact_email?: string
  sports?: string
  primary_sport?: string
  social?: string
  instagram_url?: string
  facebook_url?: string
  submit?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([])
  const [communes, setCommunes] = useState<{ id: number; name: string }[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [sportSearch, setSportSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const handleResetForm = () => {
    resetForm()
    router.push('/registrar')
  }

  const resetForm = () => {
    setSubmitted(false)
    setFormData({
      name: '',
      description: '',
      region_id: '',
      commune_id: '',
      instagram_url: '',
      facebook_url: '',
      contact_email: '',
      sports: [],
      primary_sport: null
    })
    setErrors({})
    setSportSearch('')
  }

  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [submitted])

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    region_id: '',
    commune_id: '',
    instagram_url: '',
    facebook_url: '',
    contact_email: '',
    sports: [],
    primary_sport: null
  })

  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    async function loadData() {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`
      }

      const [regionsRes, sportsRes] = await Promise.all([
        fetch(`${baseUrl}/rest/v1/regions?select=*&order=name`, { headers }),
        fetch(`${baseUrl}/rest/v1/sports?is_active=eq.true&select=*&order=name`, { headers })
      ])
      
      const regionsData = await regionsRes.json()
      const sportsData = await sportsRes.json()
      
      if (regionsData) setRegions(regionsData)
      if (sportsData) setSports(sportsData)
    }
    loadData()
  }, [])

  useEffect(() => {
    async function loadCommunes() {
      if (!formData.region_id) {
        setCommunes([])
        return
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`
      }

      const res = await fetch(
        `${baseUrl}/rest/v1/communes?region_id=eq.${formData.region_id}&select=*&order=name`, 
        { headers }
      )
      const data = await res.json()
      
      if (data) setCommunes(data)
    }
    loadCommunes()
  }, [formData.region_id])

  const filteredSports = sports.filter(s => 
    s.name.toLowerCase().includes(sportSearch.toLowerCase())
  )

  const handleSportToggle = (sportId: number) => {
    const current = formData.sports
    if (current.includes(sportId)) {
      setFormData({
        ...formData,
        sports: current.filter(id => id !== sportId),
        primary_sport: formData.primary_sport === sportId ? null : formData.primary_sport
      })
    } else if (current.length < 3) {
      setFormData({
        ...formData,
        sports: [...current, sportId]
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    } else if (formData.description.length < 50) {
      newErrors.description = 'La descripción debe tener al menos 50 caracteres'
    } else if (formData.description.length > 500) {
      newErrors.description = 'La descripción debe tener máximo 500 caracteres'
    }

    if (!formData.region_id) {
      newErrors.region_id = 'Selecciona una región'
    }

    if (!formData.commune_id) {
      newErrors.commune_id = 'Selecciona una comuna'
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email inválido'
    }

    if (formData.sports.length === 0) {
      newErrors.sports = 'Selecciona al menos un deporte'
    }

    if (!formData.primary_sport && formData.sports.length > 0) {
      newErrors.primary_sport = 'Selecciona el deporte principal'
    }

    if (!formData.instagram_url.trim() && !formData.facebook_url.trim()) {
      newErrors.social = 'Ingresa al menos una red social (Instagram o Facebook)'
    } else {
      if (formData.instagram_url.trim()) {
        const igValidation = validateAndNormalizeSocialUrl(formData.instagram_url, 'instagram')
        if (!igValidation.valid) {
          newErrors.instagram_url = igValidation.error
        }
      }
      if (formData.facebook_url.trim()) {
        const fbValidation = validateAndNormalizeSocialUrl(formData.facebook_url, 'facebook')
        if (!fbValidation.valid) {
          newErrors.facebook_url = fbValidation.error
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (honeypot) {
      return
    }

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }

      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
        '-' + Date.now().toString(36)

      const normalizedInstagram = formData.instagram_url.trim() 
        ? validateAndNormalizeSocialUrl(formData.instagram_url, 'instagram').normalized 
        : null
      const normalizedFacebook = formData.facebook_url.trim() 
        ? validateAndNormalizeSocialUrl(formData.facebook_url, 'facebook').normalized 
        : null

      const clubRes = await fetch(`${baseUrl}/rest/v1/clubs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name,
          slug,
          description: formData.description,
          region_id: parseInt(formData.region_id),
          commune_id: parseInt(formData.commune_id),
          instagram_url: normalizedInstagram,
          facebook_url: normalizedFacebook,
          contact_email: formData.contact_email,
          status: 'pending',
          is_featured: false,
          is_deleted: false
        })
      })

      if (!clubRes.ok) {
        const errorText = await clubRes.text()
        console.error('Club creation error:', errorText)
        throw new Error('Error al crear club')
      }

      const clubData = await clubRes.json()
      const clubId = clubData[0]?.id
      
      if (!clubId) {
        throw new Error('No se pudo obtener el ID del club')
      }
      
      for (const sportId of formData.sports) {
        await fetch(`${baseUrl}/rest/v1/club_sports`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            club_id: clubId,
            sport_id: sportId,
            is_primary: sportId === formData.primary_sport
          })
        })
      }

      setSubmitted(true)
    } catch {
      setErrors({ submit: 'Error al enviar. Intenta nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen">
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                ¡Registro enviado!
              </h1>
              <p className="text-slate-600 mb-6">
                Tu club ha sido registrado exitosamente. Pendiente de revisión por un administrador.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline">Volver al inicio</Button>
                </Link>
                <Button onClick={handleResetForm}>Registrar otro club</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Registrar Organización Deportiva
          </h1>
          <p className="text-blue-100">
            Completa el formulario para registrar un club, escuela, academia, etc.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl -mt-6">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Información del Club</h2>
              
              <Input
                label="Nombre del club *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                placeholder="Ej: Club Deportivo Santiago"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción * <span className="text-slate-400 text-xs">(50-500 caracteres)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="Describe tu club, actividades, horarios..."
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-xs text-slate-400">
                    {formData.description.length}/500
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Ubicación *</h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Región *</label>
                <select
                  value={formData.region_id}
                  onChange={(e) => setFormData({ ...formData, region_id: e.target.value, commune_id: '' })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  <option value="">Selecciona una región</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                {errors.region_id && <p className="text-sm text-red-600 mt-1">{errors.region_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Comuna *</label>
                <select
                  value={formData.commune_id}
                  onChange={(e) => setFormData({ ...formData, commune_id: e.target.value })}
                  disabled={!formData.region_id}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50"
                >
                  <option value="">Selecciona una comuna</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.commune_id && <p className="text-sm text-red-600 mt-1">{errors.commune_id}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Deportes * <span className="text-slate-400 text-xs font-normal">(máximo 3)</span></h2>
              
              <div className="relative">
                <input
                  type="text"
                  value={sportSearch}
                  onChange={(e) => setSportSearch(e.target.value)}
                  placeholder="Buscar deporte..."
                  className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {filteredSports.map((sport) => {
                  const isSelected = formData.sports.includes(sport.id)
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => handleSportToggle(sport.id)}
                      disabled={!isSelected && formData.sports.length >= 3}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'
                      }`}
                    >
                      {sport.name}
                    </button>
                  )
                })}
              </div>
              {errors.sports && <p className="text-sm text-red-600 mt-2">{errors.sports}</p>}

              {formData.sports.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Selecciona el deporte principal *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.sports.map((sportId) => {
                      const sport = sports.find(s => s.id === sportId)
                      const isPrimary = formData.primary_sport === sportId
                      return (
                        <button
                          key={sportId}
                          type="button"
                          onClick={() => setFormData({ ...formData, primary_sport: sportId })}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            isPrimary
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          ⭐ {sport?.name}
                        </button>
                      )
                    })}
                  </div>
                  {errors.primary_sport && (
                    <p className="text-sm text-red-600 mt-2">{errors.primary_sport}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Redes Sociales *</h2>
              
              <p className="text-xs text-slate-500">Copia las URLs de los perfiles de la organización deportiva.</p>

              <div>
                <Input
                  label="Instagram"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="instagram.com/tuclub"
                  error={errors.instagram_url}
                />
                
              </div>

              <div>
                <Input
                  label="Facebook"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="facebook.com/tuclub"
                  error={errors.facebook_url}
                />
                
              </div>
              
              {errors.social && <p className="text-sm text-red-600">{errors.social}</p>}
              <p className="text-xs text-slate-500">El contacto con los clubes será a través de sus redes sociales.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Persona que registra</h2>
              
              <Input
                label="Tu email*"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                error={errors.contact_email}
                placeholder="tu@email.com"
              />
              <p className="text-xs text-slate-500">Este email es solo para nosotros, no se mostrará públicamente.</p>
            </CardContent>
          </Card>

          {errors.submit && (
            <p className="text-center text-red-600 mb-4">{errors.submit}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Enviando...' : 'Registrar Club'}
          </Button>
        </form>
      </div>
    </main>
  )
}
