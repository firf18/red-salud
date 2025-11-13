import { supabase } from '../supabaseClient';
import type { Profile } from '@mobile/types';

export const profileService = {
  /**
   * Obtener perfil básico de un usuario
   */
  async getBasic(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, nombre_completo, avatar_url, email')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  /**
   * Obtener perfil completo de un usuario
   */
  async getFull(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  /**
   * Actualizar perfil
   */
  async update(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  /**
   * Actualizar avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) throw error;
  },
};
