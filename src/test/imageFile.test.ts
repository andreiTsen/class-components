import { describe, expect, it } from 'vitest';
import { imageFileToBase64 } from '../utils/imageFile';

describe('imageFileToBase64', () => {
  it('converts a png file to base64', async () => {
    await expect(
      imageFileToBase64(
        new File(['avatar'], 'avatar.png', { type: 'image/png' })
      )
    ).resolves.toBe('data:image/png;base64,YXZhdGFy');
  });

  it('rejects unsupported image extensions', async () => {
    await expect(
      imageFileToBase64(
        new File(['avatar'], 'avatar.gif', { type: 'image/gif' })
      )
    ).rejects.toThrow('Image must be a PNG or JPEG file');
  });
});
