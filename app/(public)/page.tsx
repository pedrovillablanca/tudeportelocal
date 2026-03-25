import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClubCard } from '@/components/shared/ClubCard'
import { SearchFilters } from '@/components/shared/SearchFilters'
import { Pagination } from '@/components/shared/Pagination'
import { Metadata } from 'next'
import { generateSlug } from '@/lib/utils/string-utils'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'TuDeporteLocal - Directorio de Organizaciones Deportivas en Chile',
  description: 'Encuentra clubes de fútbol, basketball, boxeo, BJJ y más cerca de ti. Base de Datos completa de organizaciones deportivas en Chile.',
  openGraph: {
    title: 'TuDeporteLocal - Directorio de Organizaciones Deportivas en Chile',
    description: 'Encuentra clubes de fútbol, basketball, boxeo, BJJ y más cerca de ti.',
    url: 'https://tudeportelocal.cl',
    siteName: 'TuDeporteLocal',
    locale: 'es_CL',
    type: 'website'
  }
}

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

function slugToIdMap<T extends { id: string | number; slug?: string; name?: string }>(
  items: T[],
  slugParam: string,
  type: 'sport' | 'commune' | 'region'
): number | undefined {
  if (!slugParam) return undefined
  
  if (type === 'region') {
    const found = items.find(item => generateSlug((item as unknown as { name: string }).name) === slugParam)
    return found ? parseInt(found.id.toString()) : undefined
  }
  
  const found = items.find(item => item.slug === slugParam)
  return found ? parseInt(found.id.toString()) : undefined
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; commune?: string; sport?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  const { data: sports } = await supabase.from('sports').select('id, slug').eq('is_active', true)
  const { data: communes } = await supabase.from('communes').select('id, slug').order('name')
  const { data: regions } = await supabase.from('regions').select('id, name').order('name')

  const regionSlug = params.region || ''
  const communeSlug = params.commune || ''
  const sportSlug = params.sport || ''

  const regionId = slugToIdMap(regions || [], regionSlug, 'region')
  const communeId = slugToIdMap(communes || [], communeSlug, 'commune')
  const sportId = slugToIdMap(sports || [], sportSlug, 'sport')

  // Get total active clubs count for hero section
  const { count: totalClubsCount } = await supabase
    .from('clubs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('is_deleted', false)
  
  const currentPage = params.page ? parseInt(params.page) : 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  let clubIds: number[] | undefined

  if (sportId) {
    const { data: sportClubs } = await supabase
      .from('club_sports')
      .select('club_id')
      .eq('sport_id', sportId)
    
    clubIds = sportClubs?.map(c => c.club_id) || []
  }

  let totalItems = 0
  let clubs: ClubWithRelations[] = []

  if (!sportId || (clubIds && clubIds.length > 0)) {
    let query = supabase
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

    if (params.q) {
      query = query.ilike('name', `%${params.q}%`)
    }

    if (regionId) {
      query = query.eq('region_id', regionId)
    }

    if (communeId) {
      query = query.eq('commune_id', communeId)
    }

    if (clubIds && clubIds.length > 0) {
      query = query.in('id', clubIds)
    }

    const { count: clubCount, data } = await query
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    totalItems = clubCount || 0
    clubs = (data || []) as unknown as ClubWithRelations[]
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const basePath = '/'

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-8 md:py-10 h-[280px] md:h-[220px]">
        {/* Optimized Background Image */}
        <Image
          src="/images/fondo2.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={60}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
            {/* Left side - Title */}
            <div className="max-w-2xl text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Encuentra{' '}
                <span className="text-[#4CB821]">donde entrenar</span>
              </h1>
              <p className="mt-2 text-sm md:text-base text-blue-100">
                Fútbol, Basketball, Boxeo, BJJ y más cerca de ti
              </p>
            </div>

            {/* Right side - Stats */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <p className="text-5xl md:text-6xl font-extrabold text-white leading-none animate-pulse">
                {totalClubsCount || 0}
              </p>
              <p className="text-sm md:text-base text-white/80 font-extrabold mt-1">
                Organizaciones Deportivas registradas<br className="hidden md:block" /> 
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Search & Results Section */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Search Filters */}
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-4 mb-8 border border-slate-200">
          <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-11 bg-slate-200 rounded-xl" /><div className="h-11 bg-slate-200 rounded-xl" /></div>}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {clubs && clubs.length > 0 
              ? `${clubs.length} de ${totalItems} club${totalItems === 1 ? '' : 'es'}`
              : 'Resultados'}
          </h2>
        </div>

        {clubs && clubs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => (
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
              No se encontraron clubes
            </p>
            <p className="text-slate-500 mt-1">
              Intenta con otros filtros o registra uno nuevo
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
