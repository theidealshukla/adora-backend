import express from 'express';
import cors from 'cors';
import path from 'path';
import { extractRoute } from './routes/extract';
import { healthRoute } from './routes/health';
import { startCleanupJob } from './services/cleanup';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const TEMP_DIR = process.env.TEMP_DIR ?? './temp';

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.resolve(TEMP_DIR)));

app.use('/health', healthRoute);
app.use('/extract', extractRoute);

startCleanupJob();

app.listen(PORT, () => {
  console.log(`Adora backend running on port ${PORT}`);
});
