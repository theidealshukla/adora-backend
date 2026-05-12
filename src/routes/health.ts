import { Router } from 'express';

export const healthRoute = Router();

healthRoute.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
