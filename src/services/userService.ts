import { supabase } from '../lib/supabase';
import { Profile } from '../lib/supabase';
import { RolesEnum } from '../abstractions/enums/roles.enum';

export interface UserWithId extends Profile {
  id: string;
}

export interface UserFilters {
  role?: RolesEnum;
  search?: string;
}

export interface UsersResponse {
  users: UserWithId[] | null;
  error: string | null;
}

export interface UserResponse {
  user: UserWithId | null;
  error: string | null;
}

export class UserService {
  // Get all users with optional filters
  static async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply role filter
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

      if (error) {
        return { users: null, error: error.message };
      }

      return { users: data || [], error: null };
    } catch (error: any) {
      return {
        users: null,
        error: error.message || 'Failed to fetch users'
      };
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<UserResponse> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Failed to fetch user'
      };
    }
  }

  // Update user role
  static async updateUserRole(userId: string, role: RolesEnum): Promise<UserResponse> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Failed to update user role'
      };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<Profile>): Promise<UserResponse> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Failed to update user profile'
      };
    }
  }

  // Delete user (soft delete by updating role or hard delete)
  static async deleteUser(userId: string): Promise<{ error: string | null }> {
    try {
      // First, delete the user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        return { error: authError.message };
      }

      // Then delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        return { error: profileError.message };
      }

      return { error: null };
    } catch (error: any) {
      return {
        error: error.message || 'Failed to delete user'
      };
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    totalUsers: number;
    usersByRole: Record<RolesEnum, number>;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) {
        return { 
          totalUsers: 0, 
          usersByRole: {} as Record<RolesEnum, number>, 
          error: error.message 
        };
      }

      const totalUsers = data.length;
      const usersByRole = data.reduce((acc, user) => {
        acc[user.role as RolesEnum] = (acc[user.role as RolesEnum] || 0) + 1;
        return acc;
      }, {} as Record<RolesEnum, number>);

      return { totalUsers, usersByRole, error: null };
    } catch (error: any) {
      return {
        totalUsers: 0,
        usersByRole: {} as Record<RolesEnum, number>,
        error: error.message || 'Failed to fetch user statistics'
      };
    }
  }
}
