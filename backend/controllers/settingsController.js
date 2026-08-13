const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/helpers');

const SETTINGS_KEYS = [
  'store_name',
  'logo',
  'whatsapp',
  'phone',
  'email',
  'social_media',
  'delivery_text_ar',
  'delivery_text_fr',
  'currency',
];

/**
 * GET /api/settings (public)
 * Get store settings.
 */
async function getSettings(req, res) {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*');

    if (error) {
      console.error('Get settings error:', error);
      return errorResponse(res, 'Failed to fetch settings.');
    }

    // Transform key-value rows into a single settings object
    const settings = {};
    if (data && data.length > 0) {
      data.forEach((row) => {
        settings[row.key] = row.value;
      });
    }

    // Provide defaults for missing keys
    const defaults = {
      store_name: 'WWenatou',
      logo: null,
      whatsapp: null,
      phone: null,
      email: null,
      social_media: {},
      delivery_text_ar: null,
      delivery_text_fr: null,
      currency: 'DA',
    };

    for (const key of SETTINGS_KEYS) {
      if (settings[key] === undefined) {
        settings[key] = defaults[key] !== undefined ? defaults[key] : null;
      }
    }

    return successResponse(res, { settings });
  } catch (err) {
    console.error('Get settings error:', err);
    return errorResponse(res, 'Server error fetching settings.');
  }
}

/**
 * PUT /api/settings (admin)
 * Update store settings.
 * Uses upsert with key-value model.
 */
async function updateSettings(req, res) {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      // Only allow known settings keys
      if (!SETTINGS_KEYS.includes(key)) {
        continue;
      }

      const { error } = await supabase
        .from('store_settings')
        .upsert(
          { key, value: typeof value === 'string' ? value : JSON.stringify(value) },
          { onConflict: 'key' }
        );

      if (error) {
        console.error(`Update setting "${key}" error:`, error);
        return errorResponse(res, `Failed to update setting: ${key}.`);
      }
    }

    // Fetch updated settings to return
    const { data, error: fetchError } = await supabase
      .from('store_settings')
      .select('*');

    if (fetchError) {
      console.error('Fetch updated settings error:', fetchError);
      return errorResponse(res, 'Settings updated but failed to fetch result.');
    }

    const settings = {};
    if (data) {
      data.forEach((row) => {
        settings[row.key] = row.value;
      });
    }

    return successResponse(res, { settings });
  } catch (err) {
    console.error('Update settings error:', err);
    return errorResponse(res, 'Server error updating settings.');
  }
}

module.exports = {
  getSettings,
  updateSettings,
};
