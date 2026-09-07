import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRouter from './api/routes/projects.routes.js';
import anomaliesRouter from './api/routes/anomalies.routes.js';
import analyticsRouter from './api/routes/analytics.routes.js';
import gisRouter from './api/routes/gis.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateHouse } from './middleware/validation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(validateHouse);

// Health checks and status
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'MPLADS Sentinel API',
    timestamp: new Date().toISOString(),
  });
});

app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'MPLADS Sentinel API',
    endpoints: [
      '/health',
      '/api/projects',
      '/api/anomalies',
      '/api/analytics',
      '/api/gis',
    ],
  });
});

// Mount modular REST APIs
app.use('/api/projects', projectsRouter);
app.use('/api/anomalies', anomaliesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/gis', gisRouter);

// Global error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[MPLADS Sentinel Backend] Server running on http://localhost:${PORT}`);
  });
}

export default app;
