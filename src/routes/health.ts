import { Router } from 'express';
import mongoose from 'mongoose';

import config from '@/config';

const router = Router();

const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// Liveness + readiness probe. Returns 503 when the database is not connected
// so load balancers and uptime monitors can distinguish a degraded service.
router.get('/', (_req, res) => {
  const databaseState = mongoose.connection.readyState;
  const databaseConnected = databaseState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'OK' : 'DEGRADED',
    version: '1.0.0',
    environment: config.nodeEnv ?? 'unknown',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      connected: databaseConnected,
      state: databaseStates[databaseState] ?? 'unknown',
    },
  });
});

export default router;
