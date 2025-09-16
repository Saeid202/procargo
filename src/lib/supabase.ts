import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '../config/supabase'
import { RolesEnum } from '../abstractions/enums/roles.enum'

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// Types based on your database schema
export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  company_name: string | null
  created_at: string | null
  updated_at: string | null
  email: string | null
  role: RolesEnum
}

export interface AuthUser {
  id: string
  email: string
  created_at: string
}
