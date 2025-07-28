import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { quoteRoutes } from './api/routes/quoteRoutes';
import { bridgeRoutes } from './api/routes/bridgeRoutes';
import { simulationRoutes } from './api/routes/simulationRoutes';

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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ScamSquatch Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1', quoteRoutes);
app.use('/api/v1', bridgeRoutes);
app.use('/api/v1', simulationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
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