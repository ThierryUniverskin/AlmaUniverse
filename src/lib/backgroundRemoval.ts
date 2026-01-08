const BACKGROUND_COLOR = 'E5E5E5'; // Light gray (without #)

/**
 * Remove background from an image and replace with light gray.
 * Uses remove.bg API for high-quality results.
 */
export async function removeBackground(imageFile: File): Promise<File> {
  // Prepare form data
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('size', 'auto');
  formData.append('format', 'jpg');
  formData.append('bg_color', BACKGROUND_COLOR);

  // Call remove.bg API
  const apiKey = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_REMOVE_BG_API_KEY is not configured');
  }

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('remove.bg API error:', response.status, errorText);
    throw new Error(`Background removal failed: ${response.status}`);
  }

  // Get the result as blob
  const resultBlob = await response.blob();

  // Return as File with original name
  const originalName = imageFile.name.replace(/\.[^/.]+$/, '') + '_processed.jpg';
  return new File([resultBlob], originalName, { type: 'image/jpeg' });
}
