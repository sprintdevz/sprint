import { CameraView, useCameraPermissions } from 'expo-camera';

/**
 * Camera service — used for form-video capture (Pro: video analysis).
 * Re-exports the camera view + permission helpers so screens never talk to
 * expo-camera directly.
 */

export { CameraView, useCameraPermissions };

export const CAMERA_PERMISSION_LABEL =
  'SPRINT needs camera access to record your technique for video analysis.';

export interface RecordedVideo {
  uri: string;
  durationMs: number | null;
  size: number | null;
}

/** Normalize the CameraView onRecord callback payload. */
export function normalizeRecording(payload: {
  uri: string;
  durationMs?: number;
  fileSize?: number;
}): RecordedVideo {
  return {
    uri: payload.uri,
    durationMs: payload.durationMs ?? null,
    size: payload.fileSize ?? null,
  };
}