import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../app/components/ui/button'

export default function AdminCreateAccount() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function createAccount(e?: React.FormEvent) {
    e?.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      // WARNING: This code calls the Supabase Admin REST endpoint directly from the browser
      // which requires a service-role key. Exposing the service role key client-side is
      // INSECURE. Use the Edge Function provided in supabase/functions/create-admin-user if
      // you want a secure server-side approach.

      const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined
      const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)

      if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
        setMessage('Missing SERVICE_ROLE_KEY or SUPABASE_URL in your client environment variables. Use the secure Edge Function instead.')
        setLoading(false)
        return
      }

      const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          email_confirm: true,
          user_metadata: { display_name: displayName || email.split('@')[0] },
        }),
      })

      const json = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        setMessage(json?.message || JSON.stringify(json) || `Failed with status ${resp.status}`)
        setLoading(false)
        return
      }

      setMessage('User created successfully: ' + json?.id)
    } catch (err: any) {
      setMessage(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Admin: Create Confirmed User</h2>
        <p className="text-sm text-red-600 mb-4">Warning: using a service role key in the browser is insecure. Prefer deploying the Edge Function in supabase/functions/create-admin-user and use that endpoint from this page.</p>

        <form onSubmit={createAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="admin@example.com"
              title="Email address"
              aria-label="Email address"
              name="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full p-2 border rounded"
              placeholder="Temporary password"
              title="Password"
              aria-label="Password"
              name="password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display name (optional)</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Display name"
              title="Display name"
              aria-label="Display name"
              name="displayName"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading} className="px-4 py-2">
              {loading ? 'Creating…' : 'Create user'}
            </Button>
            <button
              type="button"
              onClick={() => { setEmail(''); setPassword(''); setDisplayName(''); setMessage(null); }}
              className="text-sm text-gray-600"
            >
              Reset
            </button>
          </div>

          {message && <div className="mt-2 text-sm">{message}</div>}
        </form>
      </div>
    </div>
  )
}
