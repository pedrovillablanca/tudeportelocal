interface SportSchema {
  sportName: string
  communeName: string
  regionName: string
  clubCount: number
  url: string
}

export function generateSportPageSchema({
  sportName,
  communeName,
  regionName,
  clubCount,
  url
}: SportSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name: `${sportName} en ${communeName}, ${regionName}`,
    description: `Directorio de clubes de ${sportName.toLowerCase()} en ${communeName}, ${regionName}. Encuentra ${clubCount} club${clubCount === 1 ? '' : 'es'} deportivo${clubCount === 1 ? '' : 's'}.`,
    url,
    areaServed: {
      '@type': 'City',
      name: communeName,
      containedInPlace: {
        '@type': 'State',
        name: regionName,
        containedInPlace: {
          '@type': 'Country',
          name: 'Chile'
        }
      }
    },
    numberOfItems: clubCount
  }
}

interface ClubSchema {
  name: string
  description: string | null
  address?: string | null
  communeName: string
  regionName: string
  instagramUrl?: string | null
  facebookUrl?: string | null
  sports: string[]
  url: string
}

export function generateClubSchema({
  name,
  description,
  address,
  communeName,
  regionName,
  instagramUrl,
  facebookUrl,
  sports,
  url
}: ClubSchema): object {
  const contactPoints = []
  
  if (instagramUrl) {
    contactPoints.push({
      '@type': 'ContactPoint',
      contactType: 'social media',
      url: instagramUrl,
      name: 'Instagram'
    })
  }
  
  if (facebookUrl) {
    contactPoints.push({
      '@type': 'ContactPoint',
      contactType: 'social media',
      url: facebookUrl,
      name: 'Facebook'
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name,
    description: description || `Club deportivo en ${communeName}, ${regionName}`,
    url,
    address: address ? {
      '@type': 'PostalAddress',
      addressLocality: communeName,
      addressRegion: regionName,
      addressCountry: 'CL'
    } : {
      '@type': 'PostalAddress',
      addressLocality: communeName,
      addressRegion: regionName,
      addressCountry: 'CL'
    },
    areaServed: {
      '@type': 'City',
      name: communeName,
      containedInPlace: {
        '@type': 'State',
        name: regionName,
        containedInPlace: {
          '@type': 'Country',
          name: 'Chile'
        }
      }
    },
    knowsAbout: sports.map(sport => ({
      '@type': 'Thing',
      name: sport
    })),
    ...(contactPoints.length > 0 && { contactPoint: contactPoints })
  }
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
