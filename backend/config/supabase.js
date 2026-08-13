const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'FATAL: Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Make sure these are set in your Hostinger environment variables panel.'
  );
  // Do NOT call process.exit() here — on Hostinger the process restarts in a loop
  // and the hosting platform returns 503. Instead, export a null client so the
  // server can still start and return meaningful errors on API calls.
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
