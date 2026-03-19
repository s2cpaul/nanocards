// Re-export Supabase client and helper functions from the TypeScript module
export {
  supabase,
  API_BASE_URL,
  getAuthHeaders,
  getCurrentSession,
  initializeAuth,
  validateSession,
  projectId,
  publicAnonKey,
} from './lib/supabase';

export { supabase as default } from './lib/supabase';
