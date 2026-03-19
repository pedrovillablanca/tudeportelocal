import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const RATE_LIMIT_WINDOW = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { password, redirect } = body
    
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    
    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }
    
    const cookieStore = await cookies()
    
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/'
    })
    
    return NextResponse.json({ 
      success: true, 
      redirect: redirect || '/admin/dashboard' 
    })
    
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
