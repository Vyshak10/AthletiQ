import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://hxxqfltowzaeatidecam.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eHFmbHRvd3phZWF0aWRlY2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTA1MjgsImV4cCI6MjA1ODQ2NjUyOH0.EdZxkKr0YYt1Qqp8OTOIIgdZSt5lD9TirG01Qyo0CbU'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { User } from '@supabase/supabase-js' 