import { createClient } from '@/lib/supabase/server'
import { ClubCard } from '@/components/shared/ClubCard'
import { Pagination } from '@/components/shared/Pagination'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import Script from 'next/script'
import Image from 'next/image'
import { generateSportPageSchema, generateBreadcrumbSchema } from '@/lib/seo/schema'

const ITEMS_PER_PAGE = 12

interface ClubWithRelations {
  id: string
  name: string
  slug: string
  description: string | null
  region_id: number
  commune_id: number
  address: string | null
  instagram_url: string | null
  facebook_url: string | null
  contact_email: string
  contact_phone: string | null
  status: string
  is_featured: boolean
  is_deleted: boolean
  region: { id: number; name: string } | null
  commune: { id: number; name: string; slug: string } | null
  club_sports: {
    sport: { id: number; name: string; slug: string } | null
    is_primary: boolean
  }[] | null
}

interface PageProps {
  params: Promise<{ sport: string; commune: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sport: sportSlug, commune: communeSlug } = await params
  const supabase = await createClient()

  const [{ data: sport }, { data: commune }] = await Promise.all([
    supabase.from('sports').select('name').eq('slug', sportSlug).single(),
    supabase.from('communes').select('name').eq('slug', communeSlug).single()
  ])

  if (!sport || !commune) {
    return { title: 'TuDeporteLocal' }
  }

  const baseUrl = 'https://tudeportelocal.cl'
  const canonicalUrl = `${baseUrl}/deporte/${sportSlug}/${communeSlug}`

  return {
    title: `${sport.name} en ${commune.name} | TuDeporteLocal`,
    description: `Encuentra clubes de ${sport.name.toLowerCase()} en ${commune.name}. Directorio de organizaciones deportivas en Chile.`,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `${sport.name} en ${commune.name} | TuDeporteLocal`,
      description: `Encuentra clubes de ${sport.name.toLowerCase()} en ${commune.name}.`,
      url: canonicalUrl,
      type: 'website'
    }
  }
}

export default async function SportCommunePage({ params, searchParams }: PageProps) {
  const { sport: sportSlug, commune: communeSlug } = await params
  const searchParamsResolved = await searchParams
  const supabase = await createClient()
  
  const currentPage = searchParamsResolved.page ? parseInt(searchParamsResolved.page) : 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const [{ data: sport }, { data: commune }] = await Promise.all([
    supabase.from('sports').select('id, name, slug').eq('slug', sportSlug).single(),
    supabase.from('communes').select('id, name, slug, region_id').eq('slug', communeSlug).single()
  ])

  if (!sport || !commune) {
    notFound()
  }

  const { data: region } = await supabase
    .from('regions')
    .select('name')
    .eq('id', commune.region_id)
    .single()

  const baseUrl = 'https://tudeportelocal.cl'
  const canonicalUrl = `${baseUrl}/deporte/${sportSlug}/${communeSlug}`

  const { data: sportClubs } = await supabase
    .from('club_sports')
    .select('club_id')
    .eq('sport_id', sport.id)

  const clubIds = sportClubs?.map(c => c.club_id) || []

  let totalItems = 0
  let paginatedClubs: ClubWithRelations[] = []
  let totalPages = 0

  if (clubIds.length > 0) {
    const { data: allClubs, count } = await supabase
      .from('clubs')
      .select(`
        *,
        region:regions(id, name),
        commune:communes(id, name, slug),
        club_sports(
          sport: sports(id, name, slug),
          is_primary
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .eq('is_deleted', false)
      .eq('commune_id', commune.id)
      .in('id', clubIds)
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    totalItems = count || 0
    paginatedClubs = (allClubs || []) as ClubWithRelations[]
    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  }

  const basePath = `/deporte/${sportSlug}/${communeSlug}`

  const title = `${sport.name} en ${commune.name}`

  const sportSchema = generateSportPageSchema({
    sportName: sport.name,
    communeName: commune.name,
    regionName: region?.name || '',
    clubCount: totalItems,
    url: canonicalUrl
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: baseUrl },
    { name: sport.name, url: `${baseUrl}/?sport=${sportSlug}` },
    { name: commune.name, url: canonicalUrl }
  ])

  return (
    <main className="min-h-screen">
      <Script
        id="sport-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([sportSchema, breadcrumbSchema]) }}
      />
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 py-8 md:py-10 h-[200px] md:h-[180px]">
        <Image
          src="/images/fondo2.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
          quality={60}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {title}
            </h1>
            <p className="mt-2 text-blue-100">
              {totalItems} club{totalItems === 1 ? '' : 'es'} encontrado{totalItems === 1 ? '' : 's'}
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
            <Link href={`/?sport=${sportSlug}`} className="text-slate-500 hover:text-blue-700 cursor-pointer">
              {sport.name}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-medium">{commune.name}</span>
          </nav>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {paginatedClubs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={basePath} />
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-600 text-lg font-medium">
              No se encontraron clubes de {sport.name} en {commune.name}
            </p>
            <p className="text-slate-500 mt-1">
              ¿Sabes de uno? ¡Regístralo!
            </p>
            <Link 
              href="/registrar"
              className="inline-block mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 cursor-pointer"
            >
              Registrar Club
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
