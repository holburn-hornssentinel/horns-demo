/**
 * Get the API URL dynamically based on the current hostname
 * This allows the dashboard to work from:
 * - localhost (http://localhost:3002)
 * - Local network (http://192.168.1.197:3002)
 * - Tailscale (http://100.111.213.15:3002)
 */
export function getApiUrl(): string {
  // Server-side rendering - use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
  }

  // Client-side - use current hostname
  const hostname = window.location.hostname

  // Use the same hostname but with API port (8001)
  const protocol = window.location.protocol
  return `${protocol}//${hostname}:8001`
}

/**
 * Get the HornsIQ URL dynamically based on the current hostname
 * HornsIQ runs on port 3978
 */
export function getHornsIQUrl(): string {
  // Server-side rendering - use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_HORNSIQ_URL || 'http://localhost:3978'
  }

  // Client-side - use current hostname
  const hostname = window.location.hostname

  // Use the same hostname but with HornsIQ port (3978)
  const protocol = window.location.protocol
  return `${protocol}//${hostname}:3978`
}

// Export as constants for compatibility
export const API_URL = getApiUrl()
export const HORNSIQ_URL = getHornsIQUrl()
