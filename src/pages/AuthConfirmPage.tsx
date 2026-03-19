import { useEffect, useState } from 'react'
import { supabase, projectId, publicAnonKey } from '../lib/supabase'
import { useNavigate } from 'react-router'

export default function AuthConfirmPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('Confirming your email…')

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href)

      // Accept multiple token query param names that may be emitted by different templates
      const tokenCandidates = [
        url.searchParams.get('token_hash'),
        url.searchParams.get('token'),
        url.searchParams.get('access_token'),
        url.searchParams.get('confirmation_token'),
        url.searchParams.get('ticket'),
      ]
      const token = tokenCandidates.find(Boolean) || undefined

      const type = (url.searchParams.get('type') ?? 'signup') as 'signup' | 'magiclink' | 'recovery' | 'email_change'

      if (!token) {
        setStatus('error')
        setMessage('Missing token in URL — expected token_hash, token, access_token, confirmation_token or ticket')
        return
      }

      try {
        // Try SDK verifyOtp if available (newer supabase clients)
        if ((supabase.auth as any).verifyOtp) {
          try {
            const { data, error } = await (supabase.auth as any).verifyOtp({ type, token })
            if (error) throw error
            setStatus('success')
            setMessage('Email confirmed. Redirecting to login...')
            setTimeout(() => navigate('/login'), 1200)
            return
          } catch (sdkErr) {
            console.warn('[AuthConfirmPage] SDK verifyOtp failed, falling back to REST verify:', sdkErr)
            // fallthrough to REST verify
          }
        }

        // Fallback to REST verify endpoint using hardcoded projectId/publicAnonKey
        const verifyBase = `https://${projectId}.supabase.co`;
        const verifyUrl = `${verifyBase}/auth/v1/verify`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (publicAnonKey) headers['apikey'] = publicAnonKey;

        const resp = await fetch(verifyUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ type, token }),
        })

        let json: any = {}
        try { json = await resp.json() } catch (e) { /* ignore parse errors */ }

        if (!resp.ok) {
          const errMsg = json?.msg || json?.message || `Confirm failed (status ${resp.status})`
          console.error('[AuthConfirmPage] REST verify error', resp.status, json)
          throw new Error(errMsg)
        }

        setStatus('success')
        setMessage('Email confirmed. Redirecting to login...')
        setTimeout(() => navigate('/login'), 1200)
      } catch (err: any) {
        console.error('[AuthConfirmPage] Confirmation error:', err)
        setStatus('error')
        setMessage(err?.message ?? String(err))
      }
    }

    run()
  }, [navigate])

  if (status === 'pending') return <div className="min-h-screen flex items-center justify-center">Confirming…</div>
  if (status === 'error') return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {message}</div>
  return <div className="min-h-screen flex items-center justify-center text-green-500">{message}</div>
}
