interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, 'http://localhost')
    if (page > 1) {
      url.searchParams.set('page', page.toString())
    }
    return url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''
  }

  const pages: (number | string)[] = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <a
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          ← Anterior
        </a>
      )}

      {pages.map((page, idx) => (
        typeof page === 'number' ? (
          <a
            key={idx}
            href={getPageUrl(page)}
            className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              page === currentPage
                ? 'bg-blue-700 text-white'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {page}
          </a>
        ) : (
          <span key={idx} className="px-2 py-2 text-slate-400">...</span>
        )
      ))}

      {currentPage < totalPages && (
        <a
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          Siguiente →
        </a>
      )}
    </div>
  )
}
