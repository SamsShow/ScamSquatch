import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { quoteRoutes } from './api/routes/quoteRoutes';
import { bridgeRoutes } from './api/routes/bridgeRoutes';
import { simulationRoutes } from './api/routes/simulationRoutes';
import { globalLimiter, swapLimiter, bridgeLimiter } from './middleware/rateLimiter';
import { cacheMiddleware } from './middleware/cache';
import { APIError, errorHandler } from './utils/errorHandler';
import pino from 'pino';

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(globalLimiter);

// Cache successful GET requests for 1 minute
app.use(cacheMiddleware(60));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ScamSquatch Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Apply route-specific rate limits
app.use('/api/v1/quote', swapLimiter);
app.use('/api/v1/bridge', bridgeLimiter);

// API routes
app.use('/api/v1/quote', quoteRoutes);
app.use('/api/v1/bridge', bridgeRoutes);
app.use('/api/v1/simulation', simulationRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      context: err.context
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 ScamSquatch Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
});