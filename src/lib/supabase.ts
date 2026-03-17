import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Import from the utils directory (outside src) using absolute path
// @ts-ignore - This file is auto-generated outside the src directory
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Create a singleton instance that persists across hot module reloads
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // Only create the client once
  if (_supabase) {
    return _supabase;
  }

  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      _supabase = createClient(supabaseUrl, publicAnonKey, {
        auth: {
          persistSession: true,
          storage: window.localStorage,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      });
    } else {
      // Fallback for SSR or non-browser contexts
      _supabase = createClient(supabaseUrl, publicAnonKey, {
        auth: {
          persistSession: false,
        },
      });
    }
    
    return _supabase;
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    // Create a minimal client as fallback
    _supabase = createClient(supabaseUrl, publicAnonKey);
    return _supabase;
  }
}

// Export the client - it will be created lazily when first accessed
export const supabase = getSupabaseClient();
export const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-d91f8206`;

export async function getAuthHeaders() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Return headers with access_token if authenticated, otherwise use anon key
    return {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`,
    };
  } catch (error) {
    console.error('[getAuthHeaders] Error getting auth headers:', error);
    // Fallback to anon key
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
  }
}