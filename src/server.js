import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import sequelize from './config/database.js';
import { sanitizeInput } from './middlewares/sanitize.middleware.js';
import { globalApiLimiter } from './middlewares/rateLimiter.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import allocationRoutes from './modules/allocation/allocation.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(globalApiLimiter); 
app.use(sanitizeInput);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);


const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log('All models synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error synchronizing database:', err);
  });