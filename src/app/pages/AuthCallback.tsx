import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Complete the OAuth flow and get session from URL
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) {
          setError(error.message || String(error))
          setLoading(false)
          return
        }

        // On success, navigate to app home
        if (mounted) {
          navigate('/app')
        }
      } catch (err: any) {
        setError(err?.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [navigate])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Processing sign-in...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>

  return null
}
