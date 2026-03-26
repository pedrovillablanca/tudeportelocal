export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function removeAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

interface SocialValidationResult {
  valid: boolean
  normalized: string | null
  error?: string
}

export function validateAndNormalizeSocialUrl(url: string, platform: 'instagram' | 'facebook'): SocialValidationResult {
  if (!url.trim()) {
    return { valid: false, normalized: null, error: 'Este campo es obligatorio' }
  }

  let input = url.trim()

  // Handle @username case - convert to URL format
  if (input.startsWith('@')) {
    const username = input.slice(1).trim()
    if (!username) {
      return { 
        valid: false, 
        normalized: null, 
        error: 'Ingresa el usuario sin @ (ej: instagram.com/club)' 
      }
    }
    if (platform === 'instagram') {
      input = `instagram.com/${username}`
    } else {
      input = `facebook.com/${username}`
    }
  }

  // Handle www. prefix - remove it for validation but keep as valid
  if (input.startsWith('www.')) {
    input = input.slice(4)
  }

  // Add https:// if no protocol
  let normalized = input
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized
  }

  try {
    const urlObj = new URL(normalized)
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '')

    if (platform === 'instagram') {
      const validDomains = ['instagram.com', 'instagr.am', 'ig.com']
      if (!validDomains.includes(hostname)) {
        return { 
          valid: false, 
          normalized: null, 
          error: 'Debe ser una URL de Instagram (instagram.com/...)' 
        }
      }
      const path = urlObj.pathname.replace(/^\/+/, '')
      if (!path) {
        return { 
          valid: false, 
          normalized: null, 
          error: 'Debe incluir el nombre de usuario (instagram.com/tuclub)' 
        }
      }
      // Normalize: ensure https:// and no www.
      normalized = `https://${hostname}/${path}`
    }

    if (platform === 'facebook') {
      const validDomains = ['facebook.com', 'fb.com', 'web.facebook.com']
      if (!validDomains.includes(hostname)) {
        return { 
          valid: false, 
          normalized: null, 
          error: 'Debe ser una URL de Facebook (facebook.com/...)' 
        }
      }
      const path = urlObj.pathname.replace(/^\/+/, '')
      if (!path) {
        return { 
          valid: false, 
          normalized: null, 
          error: 'Debe incluir la página o perfil (facebook.com/tupagina)' 
        }
      }
      // Normalize: ensure https:// and no www.
      normalized = `https://${hostname}/${path}`
    }

    return { valid: true, normalized }
  } catch {
    return { 
      valid: false, 
      normalized: null, 
      error: 'URL inválida. Ejemplo válido: instagram.com/tuclub' 
    }
  }
}
