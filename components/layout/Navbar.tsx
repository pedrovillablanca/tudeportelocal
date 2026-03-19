import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/horizontal2.png" 
            alt="TuDeporteLocal" 
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-6 font-bold text-lg">
          🔎 Ayudanos a hacer crecer esta base de datos y que todos encuentren donde entrenar su deporte favorito ➡️
        </div>

        <Link href="/registrar">
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            Registrar Club
          </Button>
        </Link>
      </div>
    </header>
  )
}
