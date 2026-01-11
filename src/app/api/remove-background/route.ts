import { NextRequest, NextResponse } from 'next/server';

const BACKGROUND_COLOR = 'E5E5E5'; // Light gray (without #)
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

export async function POST(request: NextRequest) {
  try {
    // Get API key from server-side environment
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Background removal service not configured' },
        { status: 503 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const imageFile = formData.get('image_file');

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIC' },
        { status: 400 }
      );
    }

    // Additional validation: check file signature (magic bytes)
    const buffer = await imageFile.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (!isValidImageSignature(bytes)) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      );
    }

    // Prepare form data for remove.bg
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', new Blob([buffer], { type: imageFile.type }), imageFile.name);
    removeBgFormData.append('size', 'auto');
    removeBgFormData.append('format', 'jpg');
    removeBgFormData.append('bg_color', BACKGROUND_COLOR);

    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('remove.bg API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Background removal failed' },
        { status: response.status }
      );
    }

    // Return the processed image
    const resultBlob = await response.blob();
    return new NextResponse(resultBlob, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${getProcessedFilename(imageFile.name)}"`,
      },
    });
  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validate image file signature (magic bytes)
 */
function isValidImageSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    return true;
  }

  // GIF: GIF87a or GIF89a
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return true;
  }

  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }

  // HEIC/HEIF: Check for ftyp box with heic/heif/mif1 brand
  // Format: ....ftypheic or ....ftypheif or ....ftypmif1
  if (
    bytes[4] === 0x66 && // f
    bytes[5] === 0x74 && // t
    bytes[6] === 0x79 && // y
    bytes[7] === 0x70    // p
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (['heic', 'heif', 'mif1', 'heix'].includes(brand)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate processed filename
 */
function getProcessedFilename(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}_processed.jpg`;
}
