import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get the directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL || 'https://hxxqfltowzaeatidecam.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eHFmbHRvd3phZWF0aWRlY2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTA1MjgsImV4cCI6MjA1ODQ2NjUyOH0.EdZxkKr0YYt1Qqp8OTOIIgdZSt5lD9TirG01Qyo0CbU'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseKey) 