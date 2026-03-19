'use client'

import { useState, useEffect, useRef } from 'react'
import { IRegion, ICommune, ISport } from '@/types/club'
import { generateSlug } from '@/lib/utils/string-utils'

interface FilterOption {
  id: string | number
  name: string
  slug?: string
  count?: number
}

interface FilterGroupProps {
  onFilterChange: (filters: {
    regionSlug?: string
    communeSlug?: string
    sportSlug?: string
  }) => void
  sportOptions?: FilterOption[]
  regionOptions?: FilterOption[]
  communeOptions?: FilterOption[]
  initialRegion?: string
  initialCommune?: string
  initialSport?: string
  type?: 'sport-only' | 'location-only' | 'all'
  disabledSport?: boolean
  disabledLocation?: boolean
  referenceData?: {
    regions: IRegion[]
    sports: ISport[]
    communes: ICommune[]
  }
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false
}: {
  options: FilterOption[]
  value: string
  onChange: (id: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(opt => 
    removeAccents(opt.name.toLowerCase()).includes(removeAccents(search.toLowerCase()))
  )

  const selectedOption = options.find(opt => opt.id.toString() === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full min-w-[160px]">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="h-11 w-full px-4 rounded-xl border-0 bg-white/90 backdrop-blur text-left focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:bg-slate-100 flex items-center justify-between gap-2 shadow-sm hover:shadow transition-shadow"
      >
        <span className={`flex-1 truncate text-sm ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedOption?.name || placeholder}
          {selectedOption?.count !== undefined && selectedOption.count > 0 && (
            <span className="text-xs text-blue-400 ml-1">({selectedOption.count})</span>
          )}
        </span>
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-40">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(false)
                setSearch('')
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              {placeholder}
            </button>
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id.toString())
                  setIsOpen(false)
                  setSearch('')
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <span className="flex-1">{option.name}</span>
                {option.count !== undefined && option.count > 0 && (
                  <span className="text-blue-600 text-xs">({option.count})</span>
                )}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function FilterGroup({ 
  onFilterChange,
  sportOptions = [],
  regionOptions = [],
  communeOptions = [],
  initialRegion = '',
  initialCommune = '',
  initialSport = '',
  type = 'all',
  disabledSport = false,
  disabledLocation = false,
  referenceData
}: FilterGroupProps) {
  const [communes, setCommunes] = useState<ICommune[]>([])
  
  const regions = referenceData?.regions || []
  const sports = referenceData?.sports || []
  
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion)
  const [selectedCommune, setSelectedCommune] = useState<string>(initialCommune)
  const [selectedSport, setSelectedSport] = useState<string>(initialSport)

  useEffect(() => {
    setSelectedRegion(initialRegion)
  }, [initialRegion])

  useEffect(() => {
    setSelectedCommune(initialCommune)
  }, [initialCommune])

  useEffect(() => {
    setSelectedSport(initialSport)
  }, [initialSport])

  useEffect(() => {
    async function loadCommunes() {
      if (!selectedRegion) {
        setCommunes([])
        return
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const headers = {
        'apikey': anonKey!,
        'Authorization': `Bearer ${anonKey}`
      }

      const res = await fetch(
        `${baseUrl}/rest/v1/communes?region_id=eq.${selectedRegion}&select=*&order=name`, 
        { headers }
      )
      const data = await res.json()
      
      if (Array.isArray(data)) setCommunes(data)
    }
    loadCommunes()
  }, [selectedRegion])

  const regionsWithCounts = (regionOptions.length > 0 ? regionOptions : regions.map(r => ({ id: r.id, name: r.name, slug: generateSlug(r.name) })))
  const communesWithCounts = (communeOptions.length > 0 ? communeOptions : (selectedRegion ? communes.map(c => ({ id: c.id, name: c.name, slug: c.slug })) : []))
  const sportsWithCounts = (sportOptions.length > 0 ? sportOptions : sports.map(s => ({ id: s.id, name: s.name, slug: s.slug })))

  const getRegionSlug = (regionId: string): string | undefined => {
    const region = regions.find(r => r.id.toString() === regionId)
    return region ? generateSlug(region.name) : undefined
  }

  const getCommuneSlug = (communeId: string): string | undefined => {
    const commune = communes.find(c => c.id.toString() === communeId)
    return commune?.slug
  }

  const getSportSlug = (sportId: string): string | undefined => {
    const sport = sports.find(s => s.id.toString() === sportId)
    return sport?.slug
  }

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId)
    setSelectedCommune('')
    onFilterChange({
      regionSlug: regionId ? getRegionSlug(regionId) : undefined,
      communeSlug: undefined,
      sportSlug: selectedSport ? getSportSlug(selectedSport) : undefined
    })
  }

  const handleCommuneChange = (communeId: string) => {
    setSelectedCommune(communeId)
    onFilterChange({
      regionSlug: selectedRegion ? getRegionSlug(selectedRegion) : undefined,
      communeSlug: communeId ? getCommuneSlug(communeId) : undefined,
      sportSlug: selectedSport ? getSportSlug(selectedSport) : undefined
    })
  }

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId)
    onFilterChange({
      regionSlug: selectedRegion ? getRegionSlug(selectedRegion) : undefined,
      communeSlug: selectedCommune ? getCommuneSlug(selectedCommune) : undefined,
      sportSlug: sportId ? getSportSlug(sportId) : undefined
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
      {type === 'sport-only' && (
        <SearchableSelect
          options={sportsWithCounts}
          value={selectedSport}
          onChange={handleSportChange}
          placeholder="Todos los deportes"
          disabled={disabledSport}
        />
      )}
      {type === 'location-only' && (
        <>
          <SearchableSelect
            options={regionsWithCounts}
            value={selectedRegion}
            onChange={handleRegionChange}
            placeholder="Todas las regiones"
            disabled={disabledLocation}
          />
          <SearchableSelect
            options={communesWithCounts}
            value={selectedCommune}
            onChange={handleCommuneChange}
            placeholder="Todas las comunas"
            disabled={disabledLocation || !selectedRegion}
          />
        </>
      )}
      {type === 'all' && (
        <>
          <SearchableSelect
            options={sportsWithCounts}
            value={selectedSport}
            onChange={handleSportChange}
            placeholder="Todos los deportes"
            disabled={disabledSport}
          />
          <SearchableSelect
            options={regionsWithCounts}
            value={selectedRegion}
            onChange={handleRegionChange}
            placeholder="Todas las regiones"
            disabled={disabledLocation}
          />
          <SearchableSelect
            options={communesWithCounts}
            value={selectedCommune}
            onChange={handleCommuneChange}
            placeholder="Todas las comunas"
            disabled={disabledLocation || !selectedRegion}
          />
        </>
      )}
    </div>
  )
}
