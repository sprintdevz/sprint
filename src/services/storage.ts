import { Platform } from 'react-native';

/**
 * Media upload service — Supabase Storage wrapper.
 * Used by video analysis (Pro feature) and avatar uploads.
 */

export interface UploadResult {
  path: string;
  publicUrl: string | null;
}

const BUCKET_VIDEOS = 'videos';
const BUCKET_AVATARS = 'avatars';

export async function uploadVideo(
  uri: string,
  athleteId: string,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const { sb } = await import('@/services/supabase');
  const client = sb();
  const ext = uri.split('.').pop() ?? 'mp4';
  const path = `${athleteId}/${Date.now()}.${ext}`;
  const res = await fetch(uri);
  const blob = await res.blob();

  const { error } = await client.storage.from(BUCKET_VIDEOS).upload(path, blob, {
    contentType: res.headers.get('content-type') ?? 'video/mp4',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  void onProgress?.(1);

  const { data: publicUrl } = client.storage.from(BUCKET_VIDEOS).getPublicUrl(path);
  return { path, publicUrl: publicUrl.publicUrl };
}

export async function uploadAvatar(uri: string, userId: string): Promise<UploadResult> {
  const { sb } = await import('@/services/supabase');
  const client = sb();
  const path = `${userId}/${Date.now()}.jpg`;
  const asset = await fetch(uri);
  const blob = await asset.blob();
  const { error } = await client.storage.from(BUCKET_AVATARS).upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = client.storage.from(BUCKET_AVATARS).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export { BUCKET_VIDEOS, BUCKET_AVATARS };