export function getLocalizedName(item: { name_ar: string; name_fr: string }, lang: string): string {
  return lang === 'ar' ? item.name_ar : item.name_fr;
}

export function getLocalizedText(item: { [key: string]: any }, field: string, lang: string): string {
  return item[`${field}_${lang}`] || item[`${field}_ar`] || '';
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString()} MRU`;
}

export function calculateDiscount(price: number, oldPrice: number): number {
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function generateCartItemId(productId: string, color: string | null, size: string | null): string {
  return `${productId}-${color || 'nocolor'}-${size || 'nosize'}`;
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  const base = `https://wa.me/${cleaned.replace('+', '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
