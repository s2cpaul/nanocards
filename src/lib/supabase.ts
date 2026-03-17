import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that credentials are available
if (!projectId || !publicAnonKey) {
  console.error('[Supabase] Missing credentials:', {
    projectId: projectId ? '✓' : '✗ Missing VITE_SUPABASE_PROJECT_ID',
    publicAnonKey: publicAnonKey ? '✓' : '✗ Missing VITE_SUPABASE_ANON_KEY',
  });
} else {
  // Validate API key format (should be a JWT)
  if (!publicAnonKey.startsWith('eyJ')) {
    console.error('[Supabase] Invalid API key format - does not appear to be a valid JWT');
  }
  console.log('[Supabase] Credentials loaded:', {
    projectId: projectId ? '✓' : '✗',
    publicAnonKeyLength: publicAnonKey?.length || 0,
    publicAnonKeyValid: publicAnonKey?.startsWith('eyJ') ? '✓' : '✗',
  });
}

const supabaseUrl = `https://${projectId}.supabase.co`;

// Create a singleton instance that persists across hot module reloads
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // Only create the client once
  if (_supabase) {
    return _supabase;
  }

  try {
    // Validate credentials before creating client
    if (!projectId || !publicAnonKey) {
      throw new Error(`Missing Supabase credentials. projectId: ${projectId ? 'set' : 'MISSING'}, publicAnonKey: ${publicAnonKey ? 'set' : 'MISSING'}`);
    }

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
    
    console.log('[Supabase] Client initialized successfully with URL:', supabaseUrl);
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

/**
 * Initialize authentication state on app load
 * This ensures sessions are properly restored and auth state is consistent
 */
export async function initializeAuth() {
  try {
    console.log('[Supabase] Initializing authentication...');
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Supabase] Session restore error:', error);
      return null;
    }
    
    if (session) {
      console.log('[Supabase] Existing session restored for:', session.user.email);
      return session;
    }
    
    console.log('[Supabase] No existing session found');
    return null;
  } catch (error) {
    console.error('[Supabase] Error initializing auth:', error);
    return null;
  }
}

/**
 * Validate and refresh session if needed
 */
export async function validateSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Supabase] Session validation error:', error);
      return null;
    }
    
    if (session) {
      // Check if token is about to expire (within 5 minutes)
      const expiresIn = session.expires_at ? session.expires_at * 1000 - Date.now() : null;
      if (expiresIn && expiresIn < 5 * 60 * 1000) {
        console.log('[Supabase] Token expiring soon, refreshing...');
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('[Supabase] Token refresh failed:', refreshError);
          return session;
        }
        
        return refreshedSession;
      }
      
      return session;
    }
    
    return null;
  } catch (error) {
    console.error('[Supabase] Error validating session:', error);
    return null;
  }
}

/**
 * Get current user session - primary method for checking auth state
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Supabase] Error getting current session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('[Supabase] Unexpected error getting session:', error);
    return null;
  }
}

export async function getAuthHeaders() {
  try {
    const session = await getCurrentSession();
    
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