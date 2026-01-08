const BACKGROUND_COLOR = '#E5E5E5'; // Light gray

export interface BackgroundRemovalProgress {
  stage: string;
  progress: number;
}

// Segmenter instance for reuse
let segmenter: import('@tensorflow-models/body-segmentation').BodySegmenter | null = null;

/**
 * Remove background from an image and replace with light gray.
 * Uses TensorFlow.js MediaPipe Selfie Segmentation - runs entirely client-side.
 */
export async function removeBackground(
  imageFile: File,
  onProgress?: (progress: BackgroundRemovalProgress) => void
): Promise<File> {
  onProgress?.({ stage: 'Loading model', progress: 0.1 });

  // Dynamic imports to avoid SSR/build issues
  const tf = await import('@tensorflow/tfjs');
  const bodySegmentation = await import('@tensorflow-models/body-segmentation');

  // Initialize TensorFlow.js backend
  await tf.ready();

  onProgress?.({ stage: 'Initializing', progress: 0.2 });

  // Create segmenter if not already created
  if (!segmenter) {
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
      runtime: 'mediapipe' as const,
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      modelType: 'general' as const,
    };
    segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
  }

  onProgress?.({ stage: 'Processing image', progress: 0.4 });

  // Load image
  const imageUrl = URL.createObjectURL(imageFile);
  const img = await loadImage(imageUrl);
  URL.revokeObjectURL(imageUrl);

  onProgress?.({ stage: 'Segmenting', progress: 0.5 });

  // Perform segmentation
  const segmentation = await segmenter.segmentPeople(img, {
    flipHorizontal: false,
    multiSegmentation: false,
    segmentBodyParts: false,
  });

  onProgress?.({ stage: 'Creating mask', progress: 0.7 });

  // Get mask data
  if (!segmentation.length || !segmentation[0].mask) {
    throw new Error('No segmentation result');
  }

  const mask = segmentation[0].mask;
  const maskCanvas = await mask.toCanvasImageSource();

  onProgress?.({ stage: 'Compositing', progress: 0.85 });

  // Create output canvas
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;

  // Draw gray background
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create temporary canvas for masked image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tempCtx = tempCanvas.getContext('2d')!;

  // Draw original image
  tempCtx.drawImage(img, 0, 0);

  // Get image data
  const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

  // Get mask data
  const maskTempCanvas = document.createElement('canvas');
  maskTempCanvas.width = img.width;
  maskTempCanvas.height = img.height;
  const maskTempCtx = maskTempCanvas.getContext('2d')!;
  maskTempCtx.drawImage(maskCanvas as CanvasImageSource, 0, 0, img.width, img.height);
  const maskData = maskTempCtx.getImageData(0, 0, canvas.width, canvas.height);

  // Apply mask to image (mask value is 0-255 where higher = person)
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Use the red channel of the mask as alpha
    const maskValue = maskData.data[i]; // 0-255
    imageData.data[i + 3] = maskValue; // Set alpha
  }

  // Put masked image data back
  tempCtx.putImageData(imageData, 0, 0);

  // Draw masked image on gray background
  ctx.drawImage(tempCanvas, 0, 0);

  onProgress?.({ stage: 'Finalizing', progress: 0.95 });

  // Convert to JPEG
  const processedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
      'image/jpeg',
      0.95
    );
  });

  onProgress?.({ stage: 'Complete', progress: 1.0 });

  // Return as File
  const originalName = imageFile.name.replace(/\.[^/.]+$/, '') + '_processed.jpg';
  return new File([processedBlob], originalName, { type: 'image/jpeg' });
}

/**
 * Load an image from a URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = url;
  });
}
