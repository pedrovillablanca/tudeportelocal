import Link from 'next/link'
import { Card } from '@/components/ui/Card'

interface ClubCardProps {
  club: {
    id: string
    name: string
    slug: string
    description: string | null
    commune: { name: string } | null
    region: { name: string } | null
    club_sports: {
      sport: { name: string; slug: string } | null
      is_primary: boolean
    }[] | null
  }
}

export function ClubCard({ club }: ClubCardProps) {
  const sports = club.club_sports?.filter(cs => cs.sport) || []
  const primarySport = sports.find(cs => cs.is_primary)
  const otherSports = sports.filter(cs => !cs.is_primary)

  return (
    <Link href={`/club/${club.slug}`}>
      <Card hover className="h-full group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              {club.name}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {club.commune?.name}, {club.region?.name}
            </p>
          </div>
        </div>

        {primarySport && (
          <div className="inline-flex items-center px-3 py-1 bg-blue-700 text-white text-sm font-medium rounded-full mb-3">
            {primarySport.sport?.name}
          </div>
        )}

        {otherSports.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {otherSports.slice(0, 2).map((cs, idx) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
              >
                {cs.sport?.name}
              </span>
            ))}
            {otherSports.length > 2 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                +{otherSports.length - 2}
              </span>
            )}
          </div>
        )}

        {club.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {club.description}
          </p>
        )}
      </Card>
    </Link>
  )
}
