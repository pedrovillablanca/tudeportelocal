import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nosotros | TuDeporteLocal',
  description: 'Conoce TuDeporteLocal - La plataforma gratuita para crear la base de datos más grande de organizaciones deportivas en Chile.'
}

export default function SobreNosotrosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Image 
              src="/images/vertical2.png" 
              alt="TuDeporteLocal" 
              width={60}
              height={60}
              className="h-15 w-auto"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Sobre Nosotros</h1>
              <p className="text-slate-500">TuDeporteLocal</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Nuestro Objetivo
              </h2>
              <p className="text-slate-600 leading-relaxed">
                <strong>TuDeporteLocal</strong> es una plataforma gratuita creada con un objetivo claro: 
                construir la base de datos más completa de organizaciones deportivas en Chile.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                Creemos que el deporte es una herramienta fundamental para la salud, la educación y el desarrollo 
                social. Por eso, queremos facilitar que todas las personas encuentren fácilmente el club o 
                institución deportiva más cercana a su hogar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                ¿Por qué es gratuito?
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Porque creemos que el acceso al deporte debe ser igual para todos. No cobramos a los clubes 
                por estar listados ni a los usuarios por buscar. Nuestra misión es conectar personas con 
                organizaciones deportivas de forma simple y directa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                ¿Cómo funcionamos?
              </h2>
              <ul className="text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-700 font-bold">1.</span>
                  <span>Cualquier persona puede registrar un club o organización deportiva de forma gratuita.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-700 font-bold">2.</span>
                  <span>Nuestro equipo revisa cada registro para asegurar la calidad de la información.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-700 font-bold">3.</span>
                  <span>Los clubes aprobados aparecen en la página y son encontrados por miles de personas.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                ¡Únete a nuestra comunidad!
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Si conoces un club deportivo que no está en nuestra base de datos, 
                <Link href="/registrar" className="text-blue-700 hover:underline font-medium"> regístralo aquí</Link>. 
                Entre todos podemos crear el directorio más completo de organizaciones deportivas en Chile.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
