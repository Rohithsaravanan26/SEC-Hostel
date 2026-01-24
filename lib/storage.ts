import { createClient } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFile = async (file: File): Promise<string | null> => {
    try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            console.error('File too large:', file.size, 'bytes. Max size:', MAX_FILE_SIZE, 'bytes');
            throw new Error('File size exceeds 5MB limit');
        }

        const supabase = createClient();

        // Generate a unique file path: timestamp_filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('Uploading file to storage bucket...', { fileName, filePath, fileSize: file.size });

        const { data, error } = await supabase.storage
            .from('leave_docs')
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading file to storage:', error);
            throw new Error(`Storage upload failed: ${error.message}`);
        }

        console.log('File upload successful:', data);

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('leave_docs')
            .getPublicUrl(filePath);

        console.log('Generated public URL:', publicUrlData.publicUrl);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('uploadFile error:', error);
        return null;
    }
};
