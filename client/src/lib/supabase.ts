import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Debug logging
console.log('Initializing Supabase with URL:', supabaseUrl)

// Ensure URL has https:// prefix and ends with no trailing slash
const formattedUrl = supabaseUrl.startsWith('https://')
  ? supabaseUrl.replace(/\/$/, '')
  : `https://${supabaseUrl}`.replace(/\/$/, '')

console.log('Formatted Supabase URL:', formattedUrl)

export const supabase = createClient<Database>(formattedUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x'
    }
  },
  db: {
    schema: 'public'
  }
})

// Add error logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event)
  if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.email)
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')
  }
})

// Test the connection with explicit URL
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('Successfully connected to Supabase')
  } catch (error) {
    console.error('Error connecting to Supabase:', error instanceof Error ? error.message : error)
  }
}

testConnection()

export type { User } from '@supabase/supabase-js' 