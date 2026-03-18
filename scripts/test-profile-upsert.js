#!/usr/bin/env node
// scripts/test-profile-upsert.js
// Simple Node script that upserts a test profile using the Supabase REST API and the service role key.
// Usage: source .env.local && node scripts/test-profile-upsert.js

const SUPABASE_URL = process.env.SUPABASE_URL || (process.env.VITE_SUPABASE_PROJECT_ID ? `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co` : undefined);
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL OR SUPABASE_SERVICE_ROLE_KEY. You can `source .env.local` before running this script.');
  process.exit(1);
}

const profile = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test+profile@example.com',
  display_name: 'Test User',
  subscription_tier: 'free'
};

(async () => {
  try {
    console.log('Posting to', `${SUPABASE_URL}/rest/v1/profiles`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(profile),
    });

    const text = await res.text();
    console.log('HTTP', res.status);
    try {
      console.log('Response body:', JSON.parse(text));
    } catch (e) {
      console.log('Response body (raw):', text);
    }

    if (res.ok) {
      console.log('Success: profile upserted');
      process.exit(0);
    } else {
      console.error('Upsert failed');
      process.exit(2);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(3);
  }
})();
