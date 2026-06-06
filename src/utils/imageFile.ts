const allowedImageTypes = new Set(['image/png', 'image/jpeg']);
const allowedImageExtensions = ['.png', '.jpg', '.jpeg'];
const maxImageSize = 1_000_000;

function hasAllowedImageExtension(fileName: string): boolean {
  const normalizedFileName = fileName.toLowerCase();

  return allowedImageExtensions.some((extension) =>
    normalizedFileName.endsWith(extension)
  );
}

export async function imageFileToBase64(file: File): Promise<string> {
  if (
    !allowedImageTypes.has(file.type) ||
    !hasAllowedImageExtension(file.name)
  ) {
    throw new Error('Image must be a PNG or JPEG file');
  }

  if (file.size > maxImageSize) {
    throw new Error('Image must be 1MB or smaller');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    });
    reader.addEventListener('error', () => {
      reject(new Error('Image could not be read'));
    });
    reader.readAsDataURL(file);
  });
}
