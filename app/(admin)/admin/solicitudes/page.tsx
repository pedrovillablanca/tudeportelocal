'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Request {
  id: string
  club_id: string
  type: string
  description: string | null
  contact_email: string | null
  status: 'pending' | 'applied' | 'rejected'
  created_at: string
  club: { name: string; slug: string } | null
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Request[]>([])
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSolicitudes() {
      setLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`
      }

      let url = `${baseUrl}/rest/v1/update_requests?select=*,club:clubs(name,slug)&order=created_at.desc`
      if (filter === 'pending') {
        url += `&status=eq.pending`
      }

      const res = await fetch(url, { headers })
      const data = await res.json()
      setSolicitudes(data || [])
      setLoading(false)
    }
    loadSolicitudes()
  }, [filter])

  const handleStatusChange = async (requestId: string, newStatus: 'applied' | 'rejected') => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }

    await fetch(`${baseUrl}/rest/v1/update_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: newStatus })
    })

    setSolicitudes(solicitudes.filter(s => s.id !== requestId))
  }

  const typeLabels: Record<string, string> = {
    info_change: 'Cambio de información',
    social_update: 'Redes sociales',
    sports_change: 'Cambio de deportes',
    club_closed: 'Club cerrado',
    remove_profile: 'Eliminar perfil',
    other: 'Otro'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Solicitudes de Cambio</h1>
        <p className="text-slate-500 mt-1">Gestiona los cambios sugeridos por usuarios</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : solicitudes.length === 0 ? (
        <p className="text-slate-500">No hay solicitudes</p>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((request) => (
            <div key={request.id} className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'applied' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'pending' ? 'Pendiente' : request.status === 'applied' ? 'Aplicada' : 'Rechazada'}
                    </span>
                    <span className="text-sm text-slate-500">
                      {typeLabels[request.type] || request.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{request.club_id}</p>
                  <h3 className="font-bold text-slate-900">{request.club?.name}</h3>
                  {request.contact_email && (
                    <p className="text-xs text-blue-600 mt-1">{request.contact_email}</p>
                  )}
                  {request.description && (
                    <p className="text-sm text-slate-600 mt-1">{request.description}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(request.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleStatusChange(request.id, 'applied')}>
                      Aplicado
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(request.id, 'rejected')}>
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
