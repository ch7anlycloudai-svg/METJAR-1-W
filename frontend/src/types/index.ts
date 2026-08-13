export interface Product {
  id: string;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  price: number;
  old_price: number | null;
  category_id: string | null;
  available: boolean;
  featured: boolean;
  new_arrival: boolean;
  sale: boolean;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface ProductColor {
  id: string;
  product_id: string;
  name_ar: string;
  name_fr: string;
  hex_code: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_fr: string;
  slug: string;
  image: string | null;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  color: string | null;
  colorName: string | null;
  size: string | null;
  quantity: number;
  id: string;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  province: string;
  address: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  total: number;
  coupon_id: string | null;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  color: string | null;
  size: string | null;
  price: number;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface HomepageSection {
  id: string;
  section_type: string;
  title_ar: string | null;
  title_fr: string | null;
  subtitle_ar: string | null;
  subtitle_fr: string | null;
  image: string | null;
  link: string | null;
  active: boolean;
  sort_order: number;
  config: Record<string, any>;
}

export interface StoreSettings {
  store_name: string;
  logo: string;
  whatsapp: string;
  phone: string;
  email: string;
  delivery_text_ar: string;
  delivery_text_fr: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  text_ar: string;
  text_fr: string;
  rating: number;
  active: boolean;
}

export interface CustomerInfo {
  full_name: string;
  phone: string;
  province: string;
  address: string;
  notes?: string;
}
