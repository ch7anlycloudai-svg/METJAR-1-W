const supabase = require('../config/supabase');

/**
 * Generate an order number in the format WW-YYYY-NNNN
 * Auto-increments per year based on the last order number in the database.
 */
async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `WW-${year}-`;

  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .like('order_number', `${prefix}%`)
    .order('order_number', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to generate order number: ${error.message}`);
  }

  let nextNumber = 1;

  if (data && data.length > 0) {
    const lastNumber = data[0].order_number;
    const lastSequence = parseInt(lastNumber.split('-')[2], 10);
    nextNumber = lastSequence + 1;
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${prefix}${paddedNumber}`;
}

module.exports = { generateOrderNumber };
