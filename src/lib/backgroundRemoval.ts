const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(`File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new FileValidationError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIC');
  }
}

/**
 * Remove background from an image and replace with light gray.
 * Uses server-side API route to keep API key secure.
 */
export async function removeBackground(imageFile: File): Promise<File> {
  // Client-side validation for immediate feedback
  validateImageFile(imageFile);

  // Prepare form data
  const formData = new FormData();
  formData.append('image_file', imageFile);

  // Call our server-side API route (keeps API key secure)
  const response = await fetch('/api/remove-background', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Background removal failed' }));
    throw new Error(error.error || `Background removal failed: ${response.status}`);
  }

  // Get the result as blob
  const resultBlob = await response.blob();

  // Return as File with original name
  const originalName = imageFile.name.replace(/\.[^/.]+$/, '') + '_processed.jpg';
  return new File([resultBlob], originalName, { type: 'image/jpeg' });
}
