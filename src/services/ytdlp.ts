import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const TEMP_DIR = process.env.TEMP_DIR ?? './temp';
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_DOWNLOADS ?? '3', 10);
let activeJobs = 0;

export async function extractAudio(url: string, filename: string): Promise<void> {
  if (activeJobs >= MAX_CONCURRENT) {
    throw new Error('too_many_requests');
  }

  activeJobs++;
  const dir = path.resolve(TEMP_DIR);
  fs.mkdirSync(dir, { recursive: true });

  // yt-dlp uses %(ext)s in the template, then renames to mp3 via ffmpeg post-processing
  const outTemplate = path.join(dir, filename.replace(/\.mp3$/, '.%(ext)s'));

  try {
    await new Promise<void>((resolve, reject) => {
      execFile(
        'yt-dlp',
        [
          '--extract-audio',
          '--audio-format', 'mp3',
          '--audio-quality', '128K',
          '--output', outTemplate,
          '--no-playlist',
          '--socket-timeout', '30',
          url,
        ],
        { timeout: 120_000 },
        (error, _stdout, stderr) => {
          if (error) {
            console.error('[yt-dlp]', stderr);
            const msg = stderr.toLowerCase();
            if (msg.includes('private') || msg.includes('login required')) {
              reject(new Error('private_account'));
            } else {
              reject(new Error('extraction_failed'));
            }
            return;
          }

          const outPath = path.join(dir, filename);
          if (!fs.existsSync(outPath)) {
            reject(new Error('extraction_failed'));
            return;
          }

          resolve();
        },
      );
    });
  } finally {
    activeJobs--;
  }
}
