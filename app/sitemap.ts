import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tudeportelocal.cl'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${baseUrl}/registrar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ]

  // Get active clubs
  const { data: clubs } = await supabase
    .from('clubs')
    .select('slug, updated_at')
    .eq('status', 'active')
    .eq('is_deleted', false)

  const clubPages: MetadataRoute.Sitemap = (clubs || []).map((club) => ({
    url: `${baseUrl}/club/${club.slug}`,
    lastModified: new Date(club.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  // Get sports and communes for SEO pages
  const [{ data: sports }, { data: communes }] = await Promise.all([
    supabase.from('sports').select('slug').eq('is_active', true),
    supabase.from('communes').select('slug')
  ])

  // Generate sport + commune pages
  const seoPages: MetadataRoute.Sitemap = []
  
  for (const sport of sports || []) {
    for (const commune of communes || []) {
      seoPages.push({
        url: `${baseUrl}/deporte/${sport.slug}/${commune.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6
      })
    }
  }

  return [...staticPages, ...clubPages, ...seoPages]
}
