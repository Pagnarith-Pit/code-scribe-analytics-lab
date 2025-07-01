import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables - make sure these are set in your .env file
const supabaseUrl = process.env.SUPABASE_PUBLIC_URL
const supabaseKey = process.env.ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create and export the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

// Auth helper functions
export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Additional user metadata
      }
    })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}