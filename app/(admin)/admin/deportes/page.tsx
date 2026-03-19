/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Sport {
  id: number
  name: string
  slug: string
  is_active: boolean
}

export default function DeportesPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newSport, setNewSport] = useState({ name: '', slug: '' })
  const [error, setError] = useState('')

  const loadSports = useCallback(async () => {
    setLoading(true)
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`
    }

    const res = await fetch(`${baseUrl}/rest/v1/sports?select=*&order=name`, { headers })
    const data = await res.json()
    setSports(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSports()
  }, [loadSports])

  const toggleSport = async (sportId: number, currentStatus: boolean) => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }

    await fetch(`${baseUrl}/rest/v1/sports?id=eq.${sportId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active: !currentStatus })
    })

    setSports(sports.map(s => 
      s.id === sportId ? { ...s, is_active: !currentStatus } : s
    ))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    setNewSport({ name, slug: generateSlug(name) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSport.name.trim()) return
    
    setSaving(true)
    setError('')

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }

    // Get max ID and add 1
    const maxIdRes = await fetch(`${baseUrl}/rest/v1/sports?select=id&order=id.desc&limit=1`, { headers })
    const maxIdData = await maxIdRes.json()
    const newId = maxIdData.length > 0 ? maxIdData[0].id + 1 : 1

    const res = await fetch(`${baseUrl}/rest/v1/sports`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: newId,
        name: newSport.name.trim(),
        slug: newSport.slug || generateSlug(newSport.name),
        is_active: true
      })
    })

    if (res.ok) {
      setShowModal(false)
      setNewSport({ name: '', slug: '' })
      loadSports()
    } else {
      const err = await res.text()
      setError('Error al crear: ' + err)
    }

    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Deportes</h1>
          <p className="text-slate-500 mt-1">Activa o desactiva categorías deportivas</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          + Agregar Deporte
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Deporte</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Slug</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-slate-700">Estado</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-slate-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {sports.map((sport) => (
                <tr key={sport.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-900">{sport.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{sport.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sport.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sport.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleSport(sport.id, sport.is_active)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        sport.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {sport.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Agregar Deporte</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del deporte
                  </label>
                  <Input
                    value={newSport.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Fútbol, Basketball, Tennis"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Slug (URL)
                  </label>
                  <Input
                    value={newSport.slug}
                    onChange={(e) => setNewSport({ ...newSport, slug: e.target.value })}
                    placeholder="futbol-basketball-tennis"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Se genera automáticamente del nombre
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !newSport.name.trim()}
                    className="flex-1"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
