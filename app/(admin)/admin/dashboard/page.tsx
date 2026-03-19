'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClubes: 0,
    clubesActivos: 0,
    clubesPendientes: 0,
    solicitudesPendientes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`
      }

      const [clubesRes, solicitudesRes] = await Promise.all([
        fetch(`${baseUrl}/rest/v1/clubs?select=id,status`, { headers }),
        fetch(`${baseUrl}/rest/v1/update_requests?status=eq.pending&select=id`, { headers })
      ])

      const clubes = await clubesRes.json()
      const solicitudes = await solicitudesRes.json()

      const activos = clubes?.filter((c: { status: string }) => c.status === 'active').length || 0
      const pendientes = clubes?.filter((c: { status: string }) => c.status === 'pending').length || 0

      setStats({
        totalClubes: clubes?.length || 0,
        clubesActivos: activos,
        clubesPendientes: pendientes,
        solicitudesPendientes: solicitudes?.length || 0
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const statCards = [
    {
      label: 'Total Clubes',
      value: stats.totalClubes,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/admin/clubes?filter=all'
    },
    {
      label: 'Clubes Activos',
      value: stats.clubesActivos,
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/admin/clubes?filter=active'
    },
    {
      label: 'Pendientes',
      value: stats.clubesPendientes,
      color: 'yellow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/admin/clubes?filter=pending'
    },
    {
      label: 'Solicitudes',
      value: stats.solicitudesPendientes,
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/admin/solicitudes'
    }
  ]

  const colorStyles: Record<string, { bg: string, text: string, iconBg: string, iconText: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100', iconText: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-100', iconText: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen de tu directorio deportivo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const styles = colorStyles[stat.color]
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`${styles.bg} p-6 rounded-2xl border border-transparent hover:border-current/20 transition-all group cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  {loading ? (
                    <div className="h-9 w-16 bg-slate-200 animate-pulse rounded mt-1" />
                  ) : (
                    <p className={`text-3xl font-bold ${styles.text} mt-1`}>{stat.value}</p>
                  )}
                </div>
                <div className={`${styles.iconBg} p-2.5 rounded-xl ${styles.iconText} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/clubes?filter=pending"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="p-3 bg-yellow-100 rounded-xl">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Revisar clubes pendientes</p>
              <p className="text-sm text-slate-500">{stats.clubesPendientes} esperando aprobación</p>
            </div>
          </Link>

          <Link
            href="/admin/solicitudes"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Ver solicitudes de cambio</p>
              <p className="text-sm text-slate-500">{stats.solicitudesPendientes} solicitudes nuevas</p>
            </div>
          </Link>

          <Link
            href="/admin/deportes"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Gestionar deportes</p>
              <p className="text-sm text-slate-500">Activar o desactivar categorías</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
