/**
 * Simple Supabase auth helpers
 * @module lib/auth
 */

import supabase from "./supabase";

/**
 * Create a new user account.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data: any|null, error: any|null}>}
 */
export async function signup(email, password) {
  try {
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : email;

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    return { data: data ?? null, error: error ?? null };
  } catch (err) {
    console.error("Unexpected signup error:", err);
    const errorObj = err instanceof Error ? err : new Error(String(err));
    return { data: null, error: errorObj };
  }
}
