import { Result } from '@/core/types';

export function loadImage(url: string, retry = true): Promise<Result<HTMLImageElement, Error>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(Result.ok(img));
    img.onerror = () => {
      if (retry) {
        const separator = url.includes('?') ? '&' : '?';
        loadImage(`${url}${separator}t=${Date.now()}`, false).then(resolve);
      } else {
        resolve(Result.fail(new Error(`Failed to load image: ${url}`)));
      }
    };
    img.src = url;
  });
}
