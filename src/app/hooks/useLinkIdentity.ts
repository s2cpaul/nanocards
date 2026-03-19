import { useState } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * Hook to initiate provider linking for the currently-signed-in user.
 * Usage:
 * const { linkProvider, loading, error } = useLinkIdentity()
 * await linkProvider('google')
 */
export function useLinkIdentity() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function linkProvider(provider: string) {
    setLoading(true)
    setError(null)
    try {
      // This will trigger the OAuth redirect flow for linking an identity.
      // The browser will usually navigate away; when it returns, the callback route
      // should call getSessionFromUrl to complete the flow.
      const { data, error } = await supabase.auth.linkIdentity({ provider })
      if (error) throw error
      return data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { linkProvider, loading, error }
}
