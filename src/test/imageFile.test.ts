import { describe, expect, it } from 'vitest';
import { imageFileToBase64 } from '../utils/imageFile';

const oversizedAvatar = `${'a'.repeat(1_000_000)}a`;

describe('imageFileToBase64', () => {
  it('converts a png file to base64', async () => {
    await expect(
      imageFileToBase64(
        new File(['avatar'], 'avatar.png', { type: 'image/png' })
      )
    ).resolves.toBe('data:image/png;base64,YXZhdGFy');
  });

  it('rejects jpeg files when the MIME type is missing', async () => {
    await expect(
      imageFileToBase64(new File(['avatar'], 'avatar.jpg', { type: '' }))
    ).rejects.toThrow('Image must be a PNG or JPEG file');
  });

  it('rejects unsupported image extensions', async () => {
    await expect(
      imageFileToBase64(
        new File(['avatar'], 'avatar.gif', { type: 'image/gif' })
      )
    ).rejects.toThrow('Image must be a PNG or JPEG file');
  });

  it('rejects oversized images', async () => {
    await expect(
      imageFileToBase64(
        new File([oversizedAvatar], 'avatar.png', { type: 'image/png' })
      )
    ).rejects.toThrow('Image must be 1MB or smaller');
  });
});
