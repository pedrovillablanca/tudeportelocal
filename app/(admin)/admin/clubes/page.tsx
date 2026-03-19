'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { validateAndNormalizeSocialUrl } from '@/lib/utils/string-utils'

interface Club {
  id: string
  name: string
  slug: string
  description: string | null
  region_id: number
  commune_id: number
  instagram_url: string | null
  facebook_url: string | null
  contact_email: string
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  region: { id: number; name: string } | null
  commune: { id: number; name: string } | null
  club_sports: { sport_id: number; is_primary: boolean }[]
}

interface Region {
  id: number
  name: string
}

interface Commune {
  id: number
  name: string
}

interface Sport {
  id: number
  name: string
}

interface EditForm {
  name: string
  description: string
  region_id: string
  commune_id: string
  instagram_url: string
  facebook_url: string
  sports: number[]
  primary_sport: number | null
}

interface EditFormErrors {
  name?: string
  description?: string
  instagram_url?: string
  facebook_url?: string
  social?: string
}

export default function ClubesPage() {
  const [clubes, setClubes] = useState<Club[]>([])
  const [filter, setFilter] = useState<'pending' | 'active' | 'inactive' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const [regions, setRegions] = useState<Region[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    description: '',
    region_id: '',
    commune_id: '',
    instagram_url: '',
    facebook_url: '',
    sports: [],
    primary_sport: null
  })
  const [editFormErrors, setEditFormErrors] = useState<EditFormErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`
      }

      // Load clubs
      setLoading(true)
      let url = `${baseUrl}/rest/v1/clubs?select=*,region:regions(id,name),commune:communes(id,name),club_sports(sport_id,is_primary)&order=created_at.desc`
      if (filter !== 'all') {
        url += `&status=eq.${filter}`
      }

      const [clubesRes, regionsRes, sportsRes] = await Promise.all([
        fetch(url, { headers }),
        fetch(`${baseUrl}/rest/v1/regions?select=*&order=name`, { headers }),
        fetch(`${baseUrl}/rest/v1/sports?select=*&order=name`, { headers })
      ])

      setClubes(await clubesRes.json())
      setRegions(await regionsRes.json())
      setSports(await sportsRes.json())
      setLoading(false)
    }
    loadData()
  }, [filter])

  async function loadCommunes(regionId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`
    }

    const res = await fetch(`${baseUrl}/rest/v1/communes?region_id=eq.${regionId}&select=*&order=name`, { headers })
    setCommunes(await res.json())
  }

  const filteredClubes = clubes.filter(club => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      club.name.toLowerCase().includes(searchLower) ||
      club.id.toLowerCase().includes(searchLower)
    )
  })

  const openEditModal = (club: Club) => {
    setEditingClub(club)
    setEditForm({
      name: club.name,
      description: club.description || '',
      region_id: club.region_id.toString(),
      commune_id: club.commune_id.toString(),
      instagram_url: club.instagram_url || '',
      facebook_url: club.facebook_url || '',
      sports: club.club_sports?.map(cs => cs.sport_id) || [],
      primary_sport: club.club_sports?.find(cs => cs.is_primary)?.sport_id || null
    })
    loadCommunes(club.region_id.toString())
  }

  const closeEditModal = () => {
    setEditingClub(null)
    setCommunes([])
  }

  const handleSportToggle = (sportId: number) => {
    const current = editForm.sports
    if (current.includes(sportId)) {
      setEditForm({
        ...editForm,
        sports: current.filter(id => id !== sportId),
        primary_sport: editForm.primary_sport === sportId ? null : editForm.primary_sport
      })
    } else if (current.length < 3) {
      setEditForm({
        ...editForm,
        sports: [...current, sportId]
      })
    }
  }

  const handleSaveAndApprove = async () => {
    const newErrors: EditFormErrors = {}

    if (!editForm.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!editForm.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    }

    if (!editForm.instagram_url.trim() && !editForm.facebook_url.trim()) {
      newErrors.social = 'Ingresa al menos una red social (Instagram o Facebook)'
    } else {
      if (editForm.instagram_url.trim()) {
        const igValidation = validateAndNormalizeSocialUrl(editForm.instagram_url, 'instagram')
        if (!igValidation.valid) {
          newErrors.instagram_url = igValidation.error
        }
      }
      if (editForm.facebook_url.trim()) {
        const fbValidation = validateAndNormalizeSocialUrl(editForm.facebook_url, 'facebook')
        if (!fbValidation.valid) {
          newErrors.facebook_url = fbValidation.error
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setEditFormErrors(newErrors)
      return
    }

    setEditFormErrors({})
    setSaving(true)
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }

    const normalizedInstagram = editForm.instagram_url.trim() 
      ? validateAndNormalizeSocialUrl(editForm.instagram_url, 'instagram').normalized 
      : null
    const normalizedFacebook = editForm.facebook_url.trim() 
      ? validateAndNormalizeSocialUrl(editForm.facebook_url, 'facebook').normalized 
      : null

    // Update club
    await fetch(`${baseUrl}/rest/v1/clubs?id=eq.${editingClub!.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description,
        region_id: parseInt(editForm.region_id),
        commune_id: parseInt(editForm.commune_id),
        instagram_url: normalizedInstagram,
        facebook_url: normalizedFacebook,
        status: 'active'
      })
    })

    // Delete existing club_sports
    await fetch(`${baseUrl}/rest/v1/club_sports?club_id=eq.${editingClub!.id}`, {
      method: 'DELETE',
      headers
    })

    // Insert new club_sports
    for (const sportId of editForm.sports) {
      await fetch(`${baseUrl}/rest/v1/club_sports`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          club_id: editingClub!.id,
          sport_id: sportId,
          is_primary: sportId === editForm.primary_sport
        })
      })
    }

    setSaving(false)
    closeEditModal()
    
    // Reload clubs
    let url = `${baseUrl}/rest/v1/clubs?select=*,region:regions(id,name),commune:communes(id,name),club_sports(sport_id,is_primary)&order=created_at.desc`
    if (filter !== 'all') {
      url += `&status=eq.${filter}`
    }
    const res = await fetch(url, { headers })
    setClubes(await res.json())
  }

  const handleStatusChange = async (clubId: string, newStatus: 'active' | 'inactive', deleteClub = false) => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }

    if (deleteClub) {
      await fetch(`${baseUrl}/rest/v1/club_sports?club_id=eq.${clubId}`, {
        method: 'DELETE',
        headers
      })
      await fetch(`${baseUrl}/rest/v1/clubs?id=eq.${clubId}`, {
        method: 'DELETE',
        headers
      })
    } else {
      await fetch(`${baseUrl}/rest/v1/clubs?id=eq.${clubId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      })
    }

    setClubes(clubes.filter(c => c.id !== clubId))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Clubes</h1>
        <p className="text-slate-500 mt-1">Administra los clubes registrados en tu directorio</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Pendientes ({clubes.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Inactivos
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Todos
          </button>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : filteredClubes.length === 0 ? (
        <p className="text-slate-500">No hay clubes</p>
      ) : (
        <div className="space-y-3">
          {filteredClubes.map((club) => (
            <div key={club.id} className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono">{club.id}</p>
                  <h3 className="font-bold text-slate-900">{club.name}</h3>
                  <p className="text-sm text-slate-500">
                    {club.commune?.name}, {club.region?.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {club.contact_email}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(club.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {club.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => openEditModal(club)}>
                        Revisar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange(club.id, 'inactive', true)}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                  {club.status === 'active' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(club)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange(club.id, 'inactive')}
                      >
                        Desactivar
                      </Button>
                    </>
                  )}
                  {club.status === 'inactive' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(club)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(club.id, 'active')}
                      >
                        Reactivar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingClub.status === 'pending' ? 'Revisar Club' : 'Editar Club'}
              </h2>
              {editingClub.status === 'pending' && (
                <p className="text-sm text-blue-600 mt-1">
                  Correo de registro: {editingClub.contact_email}
                </p>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Región</label>
                  <select
                    value={editForm.region_id}
                    onChange={(e) => {
                      setEditForm({ ...editForm, region_id: e.target.value, commune_id: '' })
                      loadCommunes(e.target.value)
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  >
                    <option value="">Selecciona región</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Comuna</label>
                  <select
                    value={editForm.commune_id}
                    onChange={(e) => setEditForm({ ...editForm, commune_id: e.target.value })}
                    disabled={!editForm.region_id}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 disabled:opacity-50"
                  >
                    <option value="">Selecciona comuna</option>
                    {communes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Instagram</label>
                <input
                  type="text"
                  value={editForm.instagram_url}
                  onChange={(e) => setEditForm({ ...editForm, instagram_url: e.target.value })}
                  className={`w-full h-10 px-3 rounded-xl border ${editFormErrors.instagram_url ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder="instagram.com/tuclub"
                />
                {editFormErrors.instagram_url && (
                  <p className="text-sm text-red-600 mt-1">{editFormErrors.instagram_url}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Ej: instagram.com/clubdeportivo</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Facebook</label>
                <input
                  type="text"
                  value={editForm.facebook_url}
                  onChange={(e) => setEditForm({ ...editForm, facebook_url: e.target.value })}
                  className={`w-full h-10 px-3 rounded-xl border ${editFormErrors.facebook_url ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder="facebook.com/tuclub"
                />
                {editFormErrors.facebook_url && (
                  <p className="text-sm text-red-600 mt-1">{editFormErrors.facebook_url}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Ej: facebook.com/clubdeportivo</p>
              </div>

              {editFormErrors.social && (
                <p className="text-sm text-red-600">{editFormErrors.social}</p>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deportes (máx 3)</label>
                <div className="flex flex-wrap gap-2">
                  {sports.map(sport => {
                    const isSelected = editForm.sports.includes(sport.id)
                    return (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => handleSportToggle(sport.id)}
                        disabled={!isSelected && editForm.sports.length >= 3}
                        className={`px-3 py-1 rounded-full text-sm ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                        } disabled:opacity-50`}
                      >
                        {sport.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {editForm.sports.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Deporte principal</label>
                  <div className="flex flex-wrap gap-2">
                    {editForm.sports.map(sportId => {
                      const sport = sports.find(s => s.id === sportId)
                      const isPrimary = editForm.primary_sport === sportId
                      return (
                        <button
                          key={sportId}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, primary_sport: sportId })}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isPrimary ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          ⭐ {sport?.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={closeEditModal}>Cerrar</Button>
              <Button onClick={handleSaveAndApprove} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar y Aprobar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
