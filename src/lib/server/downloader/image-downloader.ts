import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/logger';

export class ImageDownloader {
  constructor(private publicImgDir: string) {}

  async ensureDir() {
    await fs.mkdir(this.publicImgDir, { recursive: true });
  }

  async download(url: string, filename: string): Promise<string | null> {
    await this.ensureDir();
    const localPath = path.join(this.publicImgDir, filename);
    
    // Check if exists
    try {
      await fs.access(localPath);
      return filename; // Already exists
    } catch {
      // Download
    }

    logger.info(`Downloading image from ${url}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        logger.error(`Failed to download image: ${url} - ${response.statusText}`);
        return null;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(localPath, buffer);
      return filename;
    } catch (error) {
      logger.error(`Error downloading image: ${url}`, error);
      return null;
    }
  }
}
