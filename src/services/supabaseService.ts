import { supabase, Profile } from '../lib/supabase'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  companyName: string
}

export interface AuthResponse {
  user: any
  error: string | null
}

export class SupabaseService {
  // Sign up with email and password, send verification link with redirect
  static async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata || {},
        },
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message || 'An error occurred during signup' }
    }
  }

  // Create profile in profiles table
  static async createProfile(userId: string, profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          company_name: profileData.company_name,
          email: profileData.email,
        }])
        .select()
        .single()

      if (error) {
        return { profile: null, error: error.message }
      }

      return { profile: data, error: null }
    } catch (error: any) {
      return { profile: null, error: error.message || 'An error occurred while creating profile' }
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message || 'An error occurred during signin' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error: any) {
      return { error: error.message || 'An error occurred during signout' }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: any; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { user: null, error: error.message }
      }

      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message || 'An error occurred while getting user' }
    }
  }

  // Get profile by user ID
  static async getProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        return { profile: null, error: error.message }
      }

      return { profile: data, error: null }
    } catch (error: any) {
      return { profile: null, error: error.message || 'An error occurred while getting profile' }
    }
  }
}
