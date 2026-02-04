import { supabase } from '@/lib/supabase';

export const MedicalService = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, doctor_details!doctor_details_profile_id_fkey(*)')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    }
};
