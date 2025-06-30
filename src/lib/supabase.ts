import { createClient, SupabaseClient  } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_PUBLIC_URL;
const supabaseKey = process.env.ANON_KEY;