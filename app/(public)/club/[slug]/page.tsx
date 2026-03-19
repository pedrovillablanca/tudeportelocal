import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { ClubSuggestChangeButton } from '@/components/shared/ClubSuggestChangeButton'
import { Metadata } from 'next'
import Script from 'next/script'
import { generateClubSchema, generateBreadcrumbSchema } from '@/lib/seo/schema'

interface ClubSport {
  sport: { name: string; slug: string } | null
  is_primary: boolean
}

interface ClubWithRelations {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  instagram_url: string | null
  facebook_url: string | null
  region: { name: string } | null
  commune: { name: string; slug: string } | null
  club_sports: ClubSport[] | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select('name, description, commune:communes(name)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!club) {
    return { title: 'Club no encontrado | TuDeporteLocal' }
  }

  const baseUrl = 'https://tudeportelocal.cl'
  const canonicalUrl = `${baseUrl}/club/${slug}`

  return {
    title: `${club.name} | TuDeporteLocal`,
    description: club.description || `${club.name} en ${(club.commune as unknown as { name: string })?.name || 'Chile'}`,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `${club.name} | TuDeporteLocal`,
      description: club.description || `${club.name} en ${(club.commune as unknown as { name: string })?.name || 'Chile'}`,
      url: canonicalUrl,
      siteName: 'TuDeporteLocal',
      locale: 'es_CL',
      type: 'website'
    }
  }
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select(`
      *,
      region:regions(name),
      commune:communes(name, slug),
      club_sports(
        sport:sports(name, slug),
        is_primary
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('is_deleted', false)
    .single()

  if (!club) {
    notFound()
  }

  const clubData = club as unknown as ClubWithRelations
  const primarySport = clubData.club_sports?.find((cs) => cs.is_primary)
  const sports = clubData.club_sports?.map((cs) => cs.sport).filter(Boolean) || []
  
  const baseUrl = 'https://tudeportelocal.cl'
  const clubUrl = `${baseUrl}/club/${clubData.slug}`
  
  const sportNames = sports.map(s => s!.name)
  
  const clubSchema = generateClubSchema({
    name: clubData.name,
    description: clubData.description,
    address: clubData.address,
    communeName: clubData.commune?.name || '',
    regionName: clubData.region?.name || '',
    instagramUrl: clubData.instagram_url,
    facebookUrl: clubData.facebook_url,
    sports: sportNames,
    url: clubUrl
  })
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: baseUrl },
    { name: clubData.name, url: clubUrl }
  ])

  return (
    <main className="min-h-screen">
      <Script
        id="club-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([clubSchema, breadcrumbSchema]) }}
      />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>

          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              {clubData.name}
            </h1>
            <p className="text-blue-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {clubData.commune?.name}, {clubData.region?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-blue-700 cursor-pointer">
              Inicio
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-medium">{clubData.name}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-4">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {/* Sports */}
              {sports.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {sports.map((sport) => (
                    <span 
                      key={sport!.slug}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        sport!.slug === primarySport?.sport?.slug 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sport!.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {clubData.description && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Descripción
                  </h2>
                  <p className="text-slate-700 leading-relaxed">
                    {clubData.description}
                  </p>
                </div>
              )}

              {/* Social Links */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Redes sociales
                </h2>
                <div className="flex flex-wrap gap-3">
                  {clubData.instagram_url && (
                    <a 
                      href={clubData.instagram_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                  )}

                  {clubData.facebook_url && (
                    <a 
                      href={clubData.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}

                  {!clubData.instagram_url && !clubData.facebook_url && (
                    <p className="text-slate-500 text-sm">No hay redes sociales disponibles</p>
                  )}
                </div>
              </div>

              {/* Suggest Change Button */}
              <div>
                <ClubSuggestChangeButton clubId={clubData.id} clubName={clubData.name} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
