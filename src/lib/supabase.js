import supabaseModule, { API_BASE_URL, initializeAuth, validateSession, getCurrentSession } from './supabase';

// supabaseModule default export is created by the TypeScript module's getSupabaseClient
// Re-export helpers to match previous runtime expectations
export const API_BASE_URL = API_BASE_URL;
export const initializeAuth = initializeAuth;
export const validateSession = validateSession;
export const getCurrentSession = getCurrentSession;

export default supabaseModule;
