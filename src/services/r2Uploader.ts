/**
 * Direct Cloudflare R2 Uploader Service
 * 
 * Requests presigned PUT URLs from backend and streams file uploads
 * directly from browser to Cloudflare R2, bypassing Django server load & limits.
 */

import axiosClient from '@/lib/axios';

export interface PresignedUrlResponse {
    upload_url: string;
    object_key: string;
    bucket: string;
    expires_in: number;
    original_filename?: string;
}

export type R2Bucket = 'audios' | 'diapositive' | 'materials' | 'images' | 'avatars';

/**
 * Get a presigned upload URL for a single file
 */
export async function getPresignedUrl(
    filename: string,
    bucket: R2Bucket,
    courseId?: string,
    contentType?: string
): Promise<PresignedUrlResponse> {
    const response = await axiosClient.post<PresignedUrlResponse>('/formation/admin/presigned-upload-url/', {
        filename,
        bucket,
        course_id: courseId,
        content_type: contentType || undefined,
    });
    return response.data;
}

/**
 * Get presigned upload URLs for a batch of files
 */
export async function getPresignedBatchUrls(
    courseId: string,
    files: Array<{ filename: string; bucket: R2Bucket; content_type?: string }>
): Promise<{ course_id: string; plan: PresignedUrlResponse[] }> {
    const response = await axiosClient.post<{ course_id: string; plan: PresignedUrlResponse[] }>(
        '/formation/admin/presigned-batch/',
        {
            course_id: courseId,
            files,
        }
    );
    return response.data;
}

/**
 * Upload a file directly from browser to Cloudflare R2 via presigned PUT URL
 */
export async function uploadFileDirectToR2(
    file: File,
    bucket: R2Bucket,
    courseId?: string,
    onProgress?: (percent: number) => void
): Promise<{ objectKey: string; bucket: string }> {
    const presigned = await getPresignedUrl(
        file.name,
        bucket,
        courseId,
        file.type || undefined
    );

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presigned.upload_url, true);

        if (file.type) {
            xhr.setRequestHeader('Content-Type', file.type);
        }

        if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                    objectKey: presigned.object_key,
                    bucket: presigned.bucket,
                });
            } else {
                reject(new Error(`R2 upload failed with HTTP ${xhr.status}: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error during R2 upload'));
        };

        xhr.send(file);
    });
}
