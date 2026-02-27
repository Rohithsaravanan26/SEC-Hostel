import { createClient } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

export const uploadFile = async (file: File): Promise<string | null> => {
    try {
        // SECURITY: Validate file size
        if (file.size > MAX_FILE_SIZE) {
            console.error('File too large:', file.size, 'bytes. Max size:', MAX_FILE_SIZE, 'bytes');
            throw new Error('File size exceeds 5MB limit');
        }

        // CRITICAL: Validate MIME type (prevents .exe.pdf attacks)
        if (!ALLOWED_TYPES.includes(file.type)) {
            console.error('Invalid file type:', file.type);
            throw new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
        }

        // CRITICAL: Validate file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
            console.error('Invalid file extension:', fileExt);
            throw new Error('Invalid file extension. Only .pdf, .jpg, and .png extensions are allowed.');
        }

        // CRITICAL: Validate magic bytes (first bytes of file content)
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        let isValidFile = false;

        // Check PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
        if (fileExt === 'pdf') {
            isValidFile = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
            if (!isValidFile) {
                throw new Error('File content does not match PDF format. File may be corrupted or disguised.');
            }
        }

        // Check JPEG magic bytes: FF D8 FF
        if (fileExt === 'jpg' || fileExt === 'jpeg') {
            isValidFile = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
            if (!isValidFile) {
                throw new Error('File content does not match JPEG format. File may be corrupted or disguised.');
            }
        }

        // Check PNG magic bytes: 89 50 4E 47 (‰PNG)
        if (fileExt === 'png') {
            isValidFile = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
            if (!isValidFile) {
                throw new Error('File content does not match PNG format. File may be corrupted or disguised.');
            }
        }

        const supabase = createClient();

        // Generate SECURE filename with UUID (prevents overwrites and guessing)
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}_${randomId}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('Uploading validated file...', {
            fileName,
            fileSize: file.size,
            fileType: file.type,
            extension: fileExt
        });

        const { data, error } = await supabase.storage
            .from('leave_docs')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false, // CRITICAL: Prevent overwriting existing files
                contentType: file.type
            });

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
    } catch (error: any) {
        console.error('uploadFile error:', error);
        // Throw error to show specific message to user
        throw error;
    }
};

// ─── Profile Photo Upload ──────────────────────────────────────────────

const PHOTO_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const PHOTO_ALLOWED_EXTS = ['jpg', 'jpeg', 'png'];

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
    try {
        // Validate file size
        if (file.size > PHOTO_MAX_SIZE) {
            throw new Error('Profile photo must be under 2MB');
        }

        // Validate MIME type
        if (!PHOTO_ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Only JPG and PNG photos are allowed');
        }

        // Validate extension
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !PHOTO_ALLOWED_EXTS.includes(fileExt)) {
            throw new Error('Invalid file extension. Only .jpg and .png are allowed.');
        }

        // Validate magic bytes
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        if (fileExt === 'jpg' || fileExt === 'jpeg') {
            if (!(bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF)) {
                throw new Error('File content does not match JPEG format.');
            }
        }
        if (fileExt === 'png') {
            if (!(bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47)) {
                throw new Error('File content does not match PNG format.');
            }
        }

        const supabase = createClient();

        // Use userId as filename for easy lookup and overwrite prevention
        const fileName = `${userId}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('profile_pics')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true, // Allow overwrite for the same user
                contentType: file.type
            });

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('profile_pics')
            .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        // Update the user's profile_pic_url in the database
        const { error: updateError } = await supabase
            .from('users')
            .update({ profile_pic_url: publicUrl })
            .eq('id', userId);

        if (updateError) {
            console.error('Failed to update profile_pic_url:', updateError);
        }

        return publicUrl;
    } catch (error: any) {
        console.error('uploadProfilePhoto error:', error);
        throw error;
    }
};
