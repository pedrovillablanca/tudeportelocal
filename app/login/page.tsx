'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin/dashboard'
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, redirect })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }
      
      router.push(data.redirect)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <Image 
              src="/images/vertical2.png" 
              alt="TuDeporteLocal" 
              width={80}
              height={80}
              className="h-20 w-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900">
              TuDeporteLocal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Panel de Administración
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              placeholder="Ingresa la contraseña"
            />
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
