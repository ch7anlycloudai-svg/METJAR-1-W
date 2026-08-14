const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;

// Accept both the legacy name and the newer Supabase dashboard name
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'FATAL: Missing required environment variables.\n' +
    'Set SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY.\n' +
    'Make sure these are set in your Hostinger environment variables panel.'
  );
}

const supabase = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

module.exports = supabase;
