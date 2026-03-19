import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image 
                src="/images/vertical2.png" 
                alt="TuDeporteLocal" 
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="font-bold text-white text-lg">TuDeporteLocal</span>
            </Link>
            <p className="text-slate-400 max-w-md">
              La base de datos más completa de organizaciones deportivas en Chile. 
              Encuentra el club perfecto para practicar el deporte que quieras.
            </p>
            <p className="text-slate-400 mt-4 text-sm">
              Contacto: tudeportelocal.cl@gmail.com
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/registrar" className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Registrar Club
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-slate-400 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-400">Términos y condiciones</span>
              </li>
              <li>
                <span className="text-slate-400">Política de privacidad</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} TuDeporteLocal. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
