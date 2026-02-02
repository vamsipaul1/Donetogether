import { supabase } from './supabase';
import { toast } from 'sonner';

export interface FileUploadResult {
    url: string;
    path: string;
    name: string;
    size: number;
    type: 'image' | 'document' | 'video' | 'audio';
}

/**
 * Get file type category from MIME type
 */
function getFileType(mimeType: string): 'image' | 'document' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - Storage bucket name (default: 'chat-files')
 * @param projectId - Project ID for organizing files
 * @returns Promise with upload result containing public URL
 */
export async function uploadFile(
    file: File,
    bucket: string = 'chat-files',
    projectId?: string
): Promise<FileUploadResult> {
    try {
        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size exceeds 50MB limit');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExt}`;

        // Create folder path
        const folderPath = projectId ? `${projectId}/${fileName}` : fileName;

        console.log('📤 Uploading file:', {
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            path: folderPath
        });

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(folderPath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        console.log('✅ Upload successful! Public URL:', publicUrl);

        return {
            url: publicUrl,
            path: data.path,
            name: file.name,
            size: file.size,
            type: getFileType(file.type)
        };

    } catch (error: any) {
        console.error('❌ File upload failed:', error);
        toast.error(`Upload failed: ${error.message}`);
        throw error;
    }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
    path: string,
    bucket: string = 'chat-files'
): Promise<void> {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;

        console.log('🗑️ File deleted:', path);
    } catch (error) {
        console.error('❌ File deletion failed:', error);
        throw error;
    }
}

/**
 * Download a file (triggers browser download)
 */
export function downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading ${filename}...`);
}

/**
 * Check if file type is an image
 */
export function isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(filename: string): string {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));

    // Document types
    if (['.pdf'].includes(ext)) return '📄';
    if (['.doc', '.docx'].includes(ext)) return '📝';
    if (['.xls', '.xlsx', '.csv'].includes(ext)) return '📊';
    if (['.ppt', '.pptx'].includes(ext)) return '📽️';
    if (['.txt', '.md'].includes(ext)) return '📃';

    // Media types
    if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) return '🎥';
    if (['.mp3', '.wav', '.ogg'].includes(ext)) return '🎵';
    if (['.zip', '.rar', '.7z'].includes(ext)) return '📦';

    // Default
    return '📎';
}
