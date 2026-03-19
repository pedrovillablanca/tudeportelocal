'use client'

import { useState } from 'react'

interface SearchBarProps {
  initialQuery?: string
  onSearch: (query: string) => void
}

export function SearchBar({ initialQuery = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)

  const handleChange = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar club por nombre..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full h-14 pl-5 pr-14 rounded-2xl border-0 bg-white/95 backdrop-blur shadow-lg shadow-black/10 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <svg
          className="w-6 h-6 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  )
}
