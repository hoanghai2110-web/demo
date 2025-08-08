
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Message {
  id: string
  user_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}
