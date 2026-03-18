#!/usr/bin/env node
// One-off admin script to delete cards by title from Supabase (cards table and kv_store_d91f8206).
// Usage:
// SUPABASE_URL=https://<project>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<service_role_key> node scripts/delete-card.js "Card Title"

import('node:process');
import { createClient } from '@supabase/supabase-js';

async function main() {
  const title = process.argv.slice(2).join(' ').trim();
  if (!title) {
    console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/delete-card.js "Card Title"');
    process.exit(1);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_PROJECT_ID && `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log(`Searching for cards with title: "${title}"`);
    const { data: cards, error: selectErr } = await supabase.from('cards').select('id,title').eq('title', title);
    if (selectErr) throw selectErr;

    if (!cards || cards.length === 0) {
      console.log('No matching rows found in "cards" table.');
    } else {
      for (const c of cards) {
        console.log('Deleting card id:', c.id, 'title:', c.title);
        const { error: delErr } = await supabase.from('cards').delete().eq('id', c.id);
        if (delErr) console.error('Failed to delete from cards table:', delErr.message);
        else console.log('Deleted from cards table:', c.id);
      }
    }

    // Try deleting matching kv_store entries where value->>title == title
    console.log('Searching kv_store_d91f8206 for matching entries...');
    const { data: kvRows, error: kvErr } = await supabase.from('kv_store_d91f8206').select('key,value').filter("value->>title", 'eq', title);
    if (kvErr) {
      console.warn('kv_store query failed:', kvErr.message);
    } else if (!kvRows || kvRows.length === 0) {
      console.log('No matching entries in kv_store_d91f8206');
    } else {
      for (const row of kvRows) {
        console.log('Deleting kv key:', row.key);
        const { error: kvDelErr } = await supabase.from('kv_store_d91f8206').delete().eq('key', row.key);
        if (kvDelErr) console.error('Failed to delete kv entry:', kvDelErr.message);
        else console.log('Deleted kv entry:', row.key);
      }
    }

    console.log('Done.');
  } catch (error) {
    console.error('Error during deletion:', error.message || error);
    process.exit(1);
  }
}

main();
