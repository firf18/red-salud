import { supabase } from '@/lib/supabase';
import type { PharmacyUser } from '@/types/user.types';

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user role and details from pharmacy_users table
    const { data: userData, error: userError } = await supabase
      .from('pharmacy_users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      // If user doesn't exist in pharmacy_users, sign out
      await supabase.auth.signOut();
      throw new Error('Usuario no autorizado para acceder a la farmacia');
    }

    if (!userData.is_active) {
      await supabase.auth.signOut();
      throw new Error('Usuario inactivo. Contacte al administrador');
    }

    return {
      user: data.user,
      session: data.session,
      pharmacyUser: userData as PharmacyUser,
    };
  }

  /**
   * Logout current user
   */
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Get current session
   */
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Get pharmacy user details
   */
  static async getPharmacyUser(userId: string) {
    const { data, error } = await supabase
      .from('pharmacy_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as PharmacyUser;
  }

  /**
   * Check if user has required role
   */
  static async hasRole(userId: string, roles: string[]) {
    const user = await this.getPharmacyUser(userId);
    return roles.includes(user.role);
  }

  /**
   * Refresh session
   */
  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  }
}
