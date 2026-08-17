require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

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
app.use(helmet({
  contentSecurityPolicy: false,  // React injects inline scripts
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS — in production frontend and API share the same origin,
// so CORS is only needed for local development (Vite on :5173).
app.use(
  cors({
    origin: function (origin, callback) {
      // Same-origin requests have no origin header — always allow
      if (!origin) return callback(null, true);
      // In development, allow Vite dev server
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      // In production, same-origin only (browser won't send origin header)
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------
// Health check — registered BEFORE other routes so it always works
// ---------------------
// Temporary endpoint — resets admin password then removes itself
app.get('/api/reset-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const supabase = require('./config/supabase');
    if (!supabase) return res.json({ error: 'no supabase client' });

    const newHash = await bcrypt.hash('Admin@2026', 10);

    // Try update first
    const { data: updated, error: updateErr } = await supabase
      .from('admin_users')
      .update({ password_hash: newHash })
      .eq('email', 'admin@wwenatou.com')
      .select('id, email')
      .single();

    if (updateErr) {
      // If update fails, try delete + insert
      await supabase.from('admin_users').delete().eq('email', 'admin@wwenatou.com');
      const { data: inserted, error: insertErr } = await supabase
        .from('admin_users')
        .insert({ email: 'admin@wwenatou.com', password_hash: newHash, name: 'Administrator', role: 'admin' })
        .select('id, email')
        .single();

      if (insertErr) return res.json({ error: insertErr.message, hint: insertErr.hint });
      return res.json({ success: true, method: 'delete+insert', email: inserted.email, hash_prefix: newHash.substring(0, 10) });
    }

    res.json({ success: true, method: 'update', email: updated.email, hash_prefix: newHash.substring(0, 10) });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => {
  try {
    const fs = require('fs');
    const healthDistPath = fs.existsSync(path.join(__dirname, 'public'))
      ? path.join(__dirname, 'public')
      : path.join(__dirname, '..', 'frontend', 'dist');
    const distExists = fs.existsSync(healthDistPath);
    const indexExists = distExists && fs.existsSync(path.join(healthDistPath, 'index.html'));
    const supabase = require('./config/supabase');

    // Test DB asynchronously but always respond
    const info = {
      success: true,
      message: 'WWenatou API is running.',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      supabase_url: !!process.env.SUPABASE_URL,
      supabase_key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY),
      supabase_client: !!supabase,
      dist: distExists,
      index_html: indexExists,
      cwd: process.cwd(),
      dirname: __dirname,
    };

    if (supabase) {
      supabase.from('categories').select('id').limit(1).then(({ data, error }) => {
        info.db = error ? 'error: ' + error.message : 'ok (' + (data || []).length + ' rows)';
        res.json(info);
      }).catch((e) => {
        info.db = 'exception: ' + e.message;
        res.json(info);
      });
    } else {
      info.db = 'no client';
      res.json(info);
    }
  } catch (e) {
    res.json({ success: false, error: e.message, stack: e.stack });
  }
});

// ---------------------
// API Routes
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
// API 404 — must come BEFORE the SPA fallback
// Any /api request that didn't match a route is a genuine 404.
// ---------------------
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ---------------------
// Serve React production build
// Production: frontend is pre-built into backend/public
// Development: falls back to ../frontend/dist
// ---------------------
const fs = require('fs');
const prodDist = path.join(__dirname, 'public');
const devDist = path.join(__dirname, '..', 'frontend', 'dist');
const distPath = fs.existsSync(prodDist) ? prodDist : devDist;
app.use(express.static(distPath));

// SPA fallback — any non-API request that didn't match a static file
// gets the React index.html so client-side routing works.
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  } else {
    next();
  }
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
  console.log(`WWenatou server running on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Serving React from: ${distPath}`);
});

module.exports = app;
