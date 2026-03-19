import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase, projectId, publicAnonKey } from '../../lib/supabase'

export default function AuthConfirm() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('loading')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const params = new URL(window.location.href).searchParams
        const tokenHash = params.get('token_hash') || params.get('token')
        const type = (params.get('type') || 'signup') as 'signup' | 'recovery' | string

        if (!tokenHash) {
          if (mounted) {
            setStatus('error')
            setMessage('Missing token in the confirmation URL')
          }
          return
        }

        // Try SDK verifyOtp; some versions use different shapes so handle errors gracefully
        try {
          const { data, error } = await (supabase.auth as any).verifyOtp({ type, token: tokenHash })
          if (error) {
            throw error
          }
          if (mounted) {
            setStatus('success')
            setMessage('Email confirmed — you can now sign in')
            setTimeout(() => navigate('/login'), 1200)
          }
          return
        } catch (err) {
          // Fallback: call the REST verify endpoint
        }

        try {
          const verifyBase = `https://${projectId}.supabase.co`;
          const url = `${verifyBase}/auth/v1/verify`;
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (publicAnonKey) headers['apikey'] = publicAnonKey;
          const resp = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ type, token: tokenHash }),
          })
          const json = await resp.json().catch(() => ({}))
          if (!resp.ok) {
            throw new Error(json?.message || 'Confirmation failed')
          }

          if (mounted) {
            setStatus('success')
            setMessage('Email confirmed — you can now sign in')
            setTimeout(() => navigate('/login'), 1200)
          }
        } catch (err: any) {
          if (mounted) {
            setStatus('error')
            setMessage(err?.message || String(err))
          }
        }
      } catch (err: any) {
        if (mounted) {
          setStatus('error')
          setMessage(err?.message || String(err))
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [navigate])

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Confirming...</div>
  if (status === 'error') return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {message}</div>
  if (status === 'success') return <div className="min-h-screen flex items-center justify-center text-green-500">{message}</div>
  return null
}
