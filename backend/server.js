require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ---------------------
// Catch uncaught errors so the process doesn't silently crash
// ---------------------
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// ---------------------
// Security & Middleware
// ---------------------
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------
// Health check — registered BEFORE other routes so it always works
// even if a route file fails to load
// ---------------------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'WWenatou API is running.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    supabase: !!process.env.SUPABASE_URL,
  });
});

// ---------------------
// Routes
// ---------------------
try {
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const categoryRoutes = require('./routes/categories');
  const orderRoutes = require('./routes/orders');
  const customerRoutes = require('./routes/customers');
  const couponRoutes = require('./routes/coupons');
  const adminRoutes = require('./routes/admin');
  const settingsRoutes = require('./routes/settings');
  const homepageRoutes = require('./routes/homepage');

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/homepage', homepageRoutes);
} catch (err) {
  console.error('Failed to load routes:', err);
}

// ---------------------
// 404 Handler
// ---------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ---------------------
// Global Error Handler
// ---------------------
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.',
  });
});

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WWenatou API server running on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
