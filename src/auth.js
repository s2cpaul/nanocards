import { supabase } from './supabase'

export async function signUpUser(email, password, fullName) {
  // 1. Create the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error }
  }

  const user = data?.user || null

  // 2. Insert a profile row (ignore profile errors for now)
  if (user) {
    try {
      await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName,
      })
    } catch (e) {
      // Non-fatal: profile upsert failed
      console.error('Profile insert failed', e)
    }
  }

  return { user }
}
