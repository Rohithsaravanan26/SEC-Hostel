import { createClient } from './supabase';

export const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createClient();

    // Generate a unique file path: timestamp_filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from('leave_docs')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading file:', error);
        return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('leave_docs')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
};
