import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = process.env.TEMP_DIR ?? './temp';
const TTL_MINUTES = parseInt(process.env.FILE_TTL_MINUTES ?? '10', 10);

export function startCleanupJob(): void {
  cron.schedule('* * * * *', () => {
    const dir = path.resolve(TEMP_DIR);
    if (!fs.existsSync(dir)) return;

    const now = Date.now();
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file);
      try {
        const { mtimeMs } = fs.statSync(filePath);
        if ((now - mtimeMs) / 60_000 > TTL_MINUTES) {
          fs.unlinkSync(filePath);
          console.log(`[cleanup] removed ${file}`);
        }
      } catch {
        // file already removed by another process
      }
    }
  });

  console.log(`[cleanup] job started (TTL: ${TTL_MINUTES}min)`);
}
