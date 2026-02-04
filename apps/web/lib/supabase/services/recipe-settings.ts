
import { supabase } from "@/lib/supabase/client";

export interface DoctorRecipeSettings {
    id: string;
    doctor_id: string;
    clinic_name: string | null;
    clinic_address: string | null;
    clinic_phone: string | null;
    clinic_email: string | null;
    use_digital_signature: boolean;
    digital_signature_url: string | null;
    use_logo: boolean;
    logo_url: string | null;
    template_id: string;
    frame_color: string;
    selected_watermark_url: string | null;
    watermark_config: {
        enabled: boolean;
        opacity: number;
        text: string;
    };
    created_at: string;
    updated_at: string;
}

export interface UpdateDoctorRecipeSettingsData {
    clinic_name?: string | null;
    clinic_address?: string | null;
    clinic_phone?: string | null;
    clinic_email?: string | null;
    use_digital_signature?: boolean;
    digital_signature_url?: string | null;
    use_logo?: boolean;
    logo_url?: string | null;
    template_id?: string;
    frame_color?: string;
    selected_watermark_url?: string | null;
    watermark_config?: {
        enabled?: boolean;
        opacity?: number;
        text?: string;
    };
}

export async function getDoctorRecipeSettings(doctorId: string) {
    const { data, error } = await supabase
        .from("doctor_recipe_settings")
        .select("*")
        .eq("doctor_id", doctorId)
        .single();

    if (error && error.code !== "PGRST116") { // 116 is no rows returned
        console.error("Error fetching recipe settings:", error.message, error);
        return { success: false, error };
    }

    // If no settings exist, create default ones
    if (!data) {
        const { data: newData, error: createError } = await supabase
            .from("doctor_recipe_settings")
            .insert({
                doctor_id: doctorId,
                watermark_config: { enabled: false, opacity: 10, text: "" },
                frame_color: '#0da9f7'
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating default recipe settings:", createError.message, createError);
            return { success: false, error: createError };
        }
        return { success: true, data: newData as DoctorRecipeSettings };
    }

    return { success: true, data: data as DoctorRecipeSettings };
}

export async function updateDoctorRecipeSettings(doctorId: string, updates: UpdateDoctorRecipeSettingsData) {
    const { data, error } = await supabase
        .from("doctor_recipe_settings")
        .update(updates)
        .eq("doctor_id", doctorId)
        .select()
        .single();

    if (error) {
        console.error("Error updating recipe settings:", error.message, error);
        return { success: false, error };
    }

    return { success: true, data: data as DoctorRecipeSettings };
}

export async function uploadRecipeAsset(
    doctorId: string,
    file: File,
    type: 'signature' | 'logo' | 'watermark'
) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${doctorId}_${type}_${Date.now()}.${fileExt}`;
    const filePath = `private_assets/${type}s/${fileName}`; // e.g., private_assets/signatures/123_signature_123.png

    const { error: uploadError } = await supabase.storage
        .from("private_assets")
        .upload(`${type}s/${fileName}`, file);

    if (uploadError) {
        console.warn("Upload to private_assets failed...", uploadError);
        return { success: false, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from("private_assets")
        .getPublicUrl(`${type}s/${fileName}`);

    return { success: true, url: publicUrl };
}
