import { Router, Request, Response } from 'express';
import { validateInstagramUrl } from '../utils/validate';
import { generateFilename } from '../utils/filename';
import { extractAudio } from '../services/ytdlp';

export const extractRoute = Router();

extractRoute.post('/', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ success: false, error: 'invalid_url' });
    return;
  }

  if (!validateInstagramUrl(url)) {
    res.status(400).json({ success: false, error: 'invalid_url' });
    return;
  }

  const filename = generateFilename();

  try {
    await extractAudio(url, filename);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      success: true,
      filename,
      downloadUrl: `${baseUrl}/files/${filename}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';

    if (message === 'too_many_requests') {
      res.status(429).json({ success: false, error: 'too_many_requests' });
    } else if (message === 'private_account') {
      res.status(422).json({ success: false, error: 'private_account' });
    } else {
      res.status(500).json({ success: false, error: 'extraction_failed' });
    }
  }
});
