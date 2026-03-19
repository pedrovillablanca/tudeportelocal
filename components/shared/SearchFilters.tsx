'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { SearchBar } from '@/components/shared/SearchBar'
import { FilterGroup } from '@/components/shared/FilterGroup'
import { IRegion, ICommune, ISport } from '@/types/club'
import { generateSlug } from '@/lib/utils/string-utils'

interface FilterOption {
  id: string | number
  name: string
  slug?: string
  count?: number
}

interface FilteredData {
  sports: { sport: ISport; count: number }[]
  regions: { region: IRegion; count: number }[]
  communes: { commune: ICommune; count: number }[]
}

export function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const regionSlugParam = searchParams.get('region') || ''
  const communeSlugParam = searchParams.get('commune') || ''
  const sportSlugParam = searchParams.get('sport') || ''
  const queryParam = searchParams.get('q') || ''

  const [allRegions, setAllRegions] = useState<IRegion[]>([])
  const [allCommunes, setAllCommunes] = useState<ICommune[]>([])
  const [allSports, setAllSports] = useState<ISport[]>([])

  const [sportFilter, setSportFilter] = useState(sportSlugParam)
  const [regionFilter, setRegionFilter] = useState(regionSlugParam)
  const [communeFilter, setCommuneFilter] = useState(communeSlugParam)

  const [filteredData, setFilteredData] = useState<FilteredData>({
    sports: [],
    regions: [],
    communes: []
  })

  const [allCounts, setAllCounts] = useState<{
    sportCounts: Record<number, number>
    regionCounts: Record<number, number>
    communeCounts: Record<number, number>
  }>({
    sportCounts: {},
    regionCounts: {},
    communeCounts: {}
  })

  useEffect(() => {
    setSportFilter(sportSlugParam)
  }, [sportSlugParam])

  useEffect(() => {
    setRegionFilter(regionSlugParam)
  }, [regionSlugParam])

  useEffect(() => {
    setCommuneFilter(communeSlugParam)
  }, [communeSlugParam])

  useEffect(() => {
    async function loadBaseData() {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`
      }

      const [regionsRes, sportsRes, communesRes, clubsRes, clubSportsRes] = await Promise.all([
        fetch(`${baseUrl}/rest/v1/regions?select=*&order=name`, { headers }),
        fetch(`${baseUrl}/rest/v1/sports?is_active=eq.true&select=*&order=name`, { headers }),
        fetch(`${baseUrl}/rest/v1/communes?select=*&order=name`, { headers }),
        fetch(`${baseUrl}/rest/v1/clubs?status=eq.active&is_deleted=eq.false&select=id,region_id,commune_id`, { headers }),
        fetch(`${baseUrl}/rest/v1/club_sports?select=club_id,sport_id`, { headers })
      ])
      
      const regionsData = await regionsRes.json()
      const sportsData = await sportsRes.json()
      const communesData = await communesRes.json()
      const clubsData = await clubsRes.json()
      const clubSportsData = await clubSportsRes.json()
      
      if (Array.isArray(regionsData)) setAllRegions(regionsData)
      if (Array.isArray(sportsData)) setAllSports(sportsData)
      if (Array.isArray(communesData)) setAllCommunes(communesData)

      const sportCounts: Record<number, number> = {}
      const regionCounts: Record<number, number> = {}
      const communeCounts: Record<number, number> = {}

      const clubIdsWithSports: Record<number, number[]> = {}
      for (const cs of Array.isArray(clubSportsData) ? clubSportsData : []) {
        if (cs.club_id && cs.sport_id) {
          if (!clubIdsWithSports[cs.club_id]) {
            clubIdsWithSports[cs.club_id] = []
          }
          clubIdsWithSports[cs.club_id].push(cs.sport_id)
        }
      }

      for (const club of Array.isArray(clubsData) ? clubsData : []) {
        if (club.region_id) {
          regionCounts[club.region_id] = (regionCounts[club.region_id] || 0) + 1
        }
        if (club.commune_id) {
          communeCounts[club.commune_id] = (communeCounts[club.commune_id] || 0) + 1
        }
        const sports = clubIdsWithSports[club.id] || []
        for (const sportId of sports) {
          sportCounts[sportId] = (sportCounts[sportId] || 0) + 1
        }
      }

      setAllCounts({ sportCounts, regionCounts, communeCounts })
    }
    loadBaseData()
  }, [])

  const fetchFilteredOptions = useCallback(async (filters: {
    sportId?: string
    regionId?: string
    communeId?: string
  }): Promise<FilteredData> => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const headers = {
      'apikey': anonKey!,
      'Authorization': `Bearer ${anonKey}`
    }

    let clubIds: number[] = []

    if (filters.sportId || filters.regionId || filters.communeId) {
      let clubsUrl = `${baseUrl}/rest/v1/clubs?status=eq.active&is_deleted=eq.false&select=id,region_id,commune_id`
      
      if (filters.regionId) {
        clubsUrl += `&region_id=eq.${filters.regionId}`
      }
      if (filters.communeId) {
        clubsUrl += `&commune_id=eq.${filters.communeId}`
      }

      const clubsRes = await fetch(clubsUrl, { headers })
      const clubsData = await clubsRes.json()
      clubIds = Array.isArray(clubsData) ? clubsData.map((c: { id: number }) => c.id) : []
    }

    if (filters.sportId && clubIds.length > 0) {
      const clubSportsRes = await fetch(
        `${baseUrl}/rest/v1/club_sports?sport_id=eq.${filters.sportId}&club_id=in.(${clubIds.join(',')})&select=club_id`, 
        { headers }
      )
      const clubSportsData = await clubSportsRes.json()
      clubIds = Array.isArray(clubSportsData) ? clubSportsData.map((cs: { club_id: number }) => cs.club_id) : []
    }

    const result: FilteredData = {
      sports: allSports.map(s => ({ sport: s, count: 0 })),
      regions: allRegions.map(r => ({ region: r, count: 0 })),
      communes: []
    }

    if (clubIds.length === 0 && (filters.sportId || filters.regionId || filters.communeId)) {
      return result
    }

    if (clubIds.length > 0) {
      const clubIdsParam = clubIds.join(',')

      const regionCounts: Record<number, number> = {}
      const communeCounts: Record<number, number> = {}
      const sportCounts: Record<number, number> = {}

      const clubsRes = await fetch(
        `${baseUrl}/rest/v1/clubs?id=in.(${clubIdsParam})&select=id,region_id,commune_id`,
        { headers }
      )
      const clubsData = await clubsRes.json()

      const clubIdsWithSport: Record<number, number[]> = {}
      const clubSportsRes = await fetch(
        `${baseUrl}/rest/v1/club_sports?club_id=in.(${clubIdsParam})&select=club_id,sport_id`,
        { headers }
      )
      const clubSportsData = await clubSportsRes.json()
      for (const cs of Array.isArray(clubSportsData) ? clubSportsData : []) {
        if (cs.club_id && cs.sport_id) {
          if (!clubIdsWithSport[cs.club_id]) {
            clubIdsWithSport[cs.club_id] = []
          }
          clubIdsWithSport[cs.club_id].push(cs.sport_id)
        }
      }

      for (const club of Array.isArray(clubsData) ? clubsData : []) {
        if (club.region_id) {
          regionCounts[club.region_id] = (regionCounts[club.region_id] || 0) + 1
        }
        if (club.commune_id) {
          communeCounts[club.commune_id] = (communeCounts[club.commune_id] || 0) + 1
        }
        const sports = clubIdsWithSport[club.id] || []
        for (const sportId of sports) {
          sportCounts[sportId] = (sportCounts[sportId] || 0) + 1
        }
      }

      const regionIdsSet = new Set(Object.keys(regionCounts).map(Number))
      const communeIdsSet = new Set(Object.keys(communeCounts).map(Number))
      const sportIdsSet = new Set(Object.keys(sportCounts).map(Number))

      if (regionIdsSet.size > 0) {
        const regionsRes = await fetch(
          `${baseUrl}/rest/v1/regions?id=in.(${Array.from(regionIdsSet).join(',')})&select=*&order=name`, 
          { headers }
        )
        const regionsData = await regionsRes.json()
        result.regions = Array.isArray(regionsData) ? regionsData.map((r: IRegion) => ({
          region: r,
          count: regionCounts[Number(r.id)] || 0
        })) : []
      }

      if (communeIdsSet.size > 0) {
        const communesRes = await fetch(
          `${baseUrl}/rest/v1/communes?id=in.(${Array.from(communeIdsSet).join(',')})&select=*&order=name`, 
          { headers }
        )
        const communesData = await communesRes.json()
        result.communes = Array.isArray(communesData) ? communesData.map((c: ICommune) => ({
          commune: c,
          count: communeCounts[Number(c.id)] || 0
        })) : []
      } else if (filters.regionId) {
        const communesRes = await fetch(
          `${baseUrl}/rest/v1/communes?region_id=eq.${filters.regionId}&select=*&order=name`, 
          { headers }
        )
        const communesData = await communesRes.json()
        result.communes = Array.isArray(communesData) ? communesData.map((c: ICommune) => ({
          commune: c,
          count: communeCounts[Number(c.id)] || 0
        })) : []
      }

      if (sportIdsSet.size > 0) {
        const sportsRes = await fetch(
          `${baseUrl}/rest/v1/sports?id=in.(${Array.from(sportIdsSet).join(',')})&select=*&order=name`, 
          { headers }
        )
        const sportsData = await sportsRes.json()
        result.sports = Array.isArray(sportsData) ? sportsData.map((s: ISport) => ({
          sport: s,
          count: sportCounts[Number(s.id)] || 0
        })) : []
      }
    } else {
      result.sports = allSports.map(s => ({
        sport: s,
        count: allCounts.sportCounts[Number(s.id)] || 0
      }))
      result.regions = allRegions.map(r => ({
        region: r,
        count: allCounts.regionCounts[Number(r.id)] || 0
      }))
      result.communes = allCommunes.map(c => ({
        commune: c,
        count: allCounts.communeCounts[Number(c.id)] || 0
      }))
    }

    return result
  }, [allSports, allRegions, allCommunes, allCounts])

  const getRegionIdFromSlug = useCallback((slug: string): string | undefined => {
    const found = allRegions.find(r => generateSlug(r.name) === slug)
    return found?.id.toString()
  }, [allRegions])

  const getCommuneIdFromSlug = useCallback((slug: string): string | undefined => {
    const found = allCommunes.find(c => c.slug === slug)
    return found?.id.toString()
  }, [allCommunes])

  const getSportIdFromSlug = useCallback((slug: string): string | undefined => {
    const found = allSports.find(s => s.slug === slug)
    return found?.id.toString()
  }, [allSports])

  useEffect(() => {
    async function updateFilters() {
      const regionId = regionFilter ? getRegionIdFromSlug(regionFilter) : undefined
      const communeId = communeFilter ? getCommuneIdFromSlug(communeFilter) : undefined
      const sportId = sportFilter ? getSportIdFromSlug(sportFilter) : undefined
      
      const result = await fetchFilteredOptions({
        sportId: sportId || undefined,
        regionId: regionId || undefined,
        communeId: communeId || undefined
      })
      setFilteredData(result)
    }
    updateFilters()
  }, [sportFilter, regionFilter, communeFilter, fetchFilteredOptions, getRegionIdFromSlug, getCommuneIdFromSlug, getSportIdFromSlug])

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleFilterChange = (filters: {
    regionSlug?: string
    communeSlug?: string
    sportSlug?: string
  }) => {
    const params = new URLSearchParams()
    
    if (filters.sportSlug !== undefined && filters.sportSlug !== '') {
      params.set('sport', filters.sportSlug)
    }
    
    if (filters.regionSlug !== undefined && filters.regionSlug !== '') {
      params.set('region', filters.regionSlug)
      if (filters.communeSlug !== undefined && filters.communeSlug !== '') {
        params.set('commune', filters.communeSlug)
      }
    }
    
    const q = searchParams.get('q')
    if (q) {
      params.set('q', q)
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const sportOptions: FilterOption[] = useMemo(() => 
    filteredData.sports
      .filter(s => s.count > 0)
      .map(s => ({ id: s.sport.id, name: s.sport.name, slug: s.sport.slug, count: s.count })),
    [filteredData.sports]
  )

  const regionOptions: FilterOption[] = useMemo(() => 
    filteredData.regions
      .filter(r => r.count > 0)
      .map(r => ({ id: r.region.id, name: r.region.name, slug: generateSlug(r.region.name), count: r.count })),
    [filteredData.regions]
  )

  const communeOptions: FilterOption[] = useMemo(() => 
    filteredData.communes
      .filter(c => c.count > 0)
      .map(c => ({ id: c.commune.id, name: c.commune.name, slug: c.commune.slug, count: c.count })),
    [filteredData.communes]
  )

  const initialRegionId = regionSlugParam ? getRegionIdFromSlug(regionSlugParam) : undefined
  const initialCommuneId = communeSlugParam ? getCommuneIdFromSlug(communeSlugParam) : undefined
  const initialSportId = sportSlugParam ? getSportIdFromSlug(sportSlugParam) : undefined

  const referenceData = {
    regions: allRegions,
    sports: allSports,
    communes: allCommunes
  }

  return (
    <div className="space-y-4">
      {/* Step 1: QUÉ - Deporte (Primary) */}
      <div>
        <label className="block text-sm font-bold text-slate-600 mb-2">
          Selecciona el deporte que buscas
        </label>
        <FilterGroup 
          onFilterChange={handleFilterChange}
          sportOptions={sportOptions}
          regionOptions={regionOptions}
          communeOptions={communeOptions}
          initialRegion={initialRegionId}
          initialCommune={initialCommuneId}
          initialSport={initialSportId}
          type="sport-only"
          referenceData={referenceData}
        />
      </div>

      {/* Step 2: DÓNDE - Comuna/Región */}
      <div className="pt-2">
        <label className="block text-sm font-bold text-slate-600 mb-2">
          Encuentra dónde practicarlo
        </label>
        <FilterGroup 
          onFilterChange={handleFilterChange}
          sportOptions={sportOptions}
          regionOptions={regionOptions}
          communeOptions={communeOptions}
          initialRegion={initialRegionId}
          initialCommune={initialCommuneId}
          initialSport={initialSportId}
          type="location-only"
          referenceData={referenceData}
        />
      </div>

      {/* Optional: QUIÉN - Buscar por nombre */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-sm font-medium text-slate-500 mb-2">
          ¿Buscas un club en particular? (Opcional)
        </label>
        <SearchBar initialQuery={queryParam} onSearch={handleSearch} />
      </div>
    </div>
  )
}
