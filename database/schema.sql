-- ============================================================================
-- WWenatou Shopping - Complete Database Schema
-- Women's E-Commerce Store - Mauritania
-- Supabase PostgreSQL
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Admin Users
-- ----------------------------------------------------------------------------
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Coupons (created before orders, since orders references coupons)
-- ----------------------------------------------------------------------------
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order DECIMAL(10,2) DEFAULT 0,
    max_uses INT,
    used_count INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Products
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    description_ar TEXT,
    description_fr TEXT,
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    new_arrival BOOLEAN DEFAULT false,
    sale BOOLEAN DEFAULT false,
    slug TEXT UNIQUE NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Product Images
-- ----------------------------------------------------------------------------
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Product Colors
-- ----------------------------------------------------------------------------
CREATE TABLE product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    hex_code TEXT NOT NULL
);

-- ----------------------------------------------------------------------------
-- Product Sizes
-- ----------------------------------------------------------------------------
CREATE TABLE product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL'))
);

-- ----------------------------------------------------------------------------
-- Orders
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    province TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT DEFAULT 'cash_on_delivery',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Order Items
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    color TEXT,
    size TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- Homepage Sections
-- ----------------------------------------------------------------------------
CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type TEXT NOT NULL,
    title_ar TEXT,
    title_fr TEXT,
    subtitle_ar TEXT,
    subtitle_fr TEXT,
    image TEXT,
    link TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Store Settings
-- ----------------------------------------------------------------------------
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL
);

-- ----------------------------------------------------------------------------
-- Testimonials
-- ----------------------------------------------------------------------------
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    text_ar TEXT,
    text_fr TEXT,
    rating INT DEFAULT 5,
    active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================================
-- 2. INDEXES
-- ============================================================================

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_homepage_sections_type ON homepage_sections(section_type);


-- ============================================================================
-- 3. FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Updated_at trigger function
-- Automatically sets updated_at to now() on row update
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Generate order number in WW-YYYY-NNNN format
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_seq INT;
BEGIN
    current_year := to_char(now(), 'YYYY');

    SELECT COALESCE(MAX(
        CAST(substring(order_number FROM '[0-9]+$') AS INT)
    ), 0) + 1
    INTO next_seq
    FROM orders
    WHERE order_number LIKE 'WW-' || current_year || '-%';

    RETURN 'WW-' || current_year || '-' || lpad(next_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Increment coupon usage count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE id = coupon_uuid;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_homepage_sections_updated_at
    BEFORE UPDATE ON homepage_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront tables
CREATE POLICY "Public can read categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Public can read available products"
    ON products FOR SELECT
    USING (available = true);

CREATE POLICY "Public can read product images"
    ON product_images FOR SELECT
    USING (true);

CREATE POLICY "Public can read product colors"
    ON product_colors FOR SELECT
    USING (true);

CREATE POLICY "Public can read product sizes"
    ON product_sizes FOR SELECT
    USING (true);

CREATE POLICY "Public can read active coupons"
    ON coupons FOR SELECT
    USING (active = true);

CREATE POLICY "Public can read active homepage sections"
    ON homepage_sections FOR SELECT
    USING (active = true);

CREATE POLICY "Public can read store settings"
    ON store_settings FOR SELECT
    USING (true);

CREATE POLICY "Public can read active testimonials"
    ON testimonials FOR SELECT
    USING (active = true);

-- Public can create orders (storefront checkout)
CREATE POLICY "Public can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can create order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

-- Admin access (INSERT, UPDATE, DELETE) is handled by the backend using the
-- Supabase service_role key, which bypasses RLS entirely. No additional
-- admin policies are needed. Only the public SELECT/INSERT policies above
-- apply to the anon role used by the storefront.


-- ============================================================================
-- 6. STORAGE BUCKET POLICY (Comment / Hint)
-- ============================================================================

-- To create the 'products' storage bucket in Supabase:
--
-- 1. Go to Supabase Dashboard > Storage > Create bucket
--    - Name: products
--    - Public: true (so images are publicly accessible)
--
-- 2. Add the following storage policies:
--
--    -- Allow public read access to product images
--    CREATE POLICY "Public read access on products bucket"
--        ON storage.objects FOR SELECT
--        USING (bucket_id = 'products');
--
--    -- Allow authenticated/service_role to upload images
--    CREATE POLICY "Admin upload access on products bucket"
--        ON storage.objects FOR INSERT
--        WITH CHECK (bucket_id = 'products');
--
--    -- Allow authenticated/service_role to update images
--    CREATE POLICY "Admin update access on products bucket"
--        ON storage.objects FOR UPDATE
--        USING (bucket_id = 'products');
--
--    -- Allow authenticated/service_role to delete images
--    CREATE POLICY "Admin delete access on products bucket"
--        ON storage.objects FOR DELETE
--        USING (bucket_id = 'products');


-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Admin user: admin@wwenatou.com / Admin@2026
-- BCrypt hash generated for 'Admin@2026'
-- ----------------------------------------------------------------------------
INSERT INTO admin_users (email, password_hash, name, role) VALUES
    ('admin@wwenatou.com', '$2b$10$IuBiuAHbETxcWu4tQG6c0OVRUySoggCCES3p.IxZ0MgFC49AC0FOC', 'Administrator', 'admin');

-- ----------------------------------------------------------------------------
-- Store Settings
-- ----------------------------------------------------------------------------
INSERT INTO store_settings (key, value) VALUES
    ('store_name', '"WWenatou Shopping"'),
    ('whatsapp', '"+22247305955"'),
    ('currency', '"MRU"'),
    ('delivery_text_ar', '"التوصيل متاح لجميع ولايات موريتانيا"'),
    ('delivery_text_fr', '"Livraison disponible dans toutes les wilayas de Mauritanie"'),
    ('free_delivery_threshold', '5000'),
    ('delivery_fee', '500'),
    ('contact_email', '"contact@wwenatou.com"'),
    ('social_instagram', '"https://instagram.com/wwenatou"'),
    ('social_facebook', '"https://facebook.com/wwenatou"');

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (name_ar, name_fr, slug, sort_order) VALUES
    ('ملابس', 'Vêtements', 'vetements', 1),
    ('حقائب', 'Sacs', 'sacs', 2),
    ('أحذية', 'Chaussures', 'chaussures', 3),
    ('إكسسوارات', 'Accessoires', 'accessoires', 4),
    ('مجوهرات', 'Bijoux', 'bijoux', 5),
    ('فساتين', 'Robes', 'robes', 6);

-- ----------------------------------------------------------------------------
-- Default Homepage Hero Section
-- ----------------------------------------------------------------------------
INSERT INTO homepage_sections (section_type, title_ar, title_fr, subtitle_ar, subtitle_fr, active, sort_order, config) VALUES
    ('hero',
     'مرحبا بكم في WWenatou',
     'Bienvenue chez WWenatou',
     'اكتشفي أحدث صيحات الموضة النسائية',
     'Découvrez les dernières tendances de la mode féminine',
     true,
     1,
     '{"buttonText_ar": "تسوقي الآن", "buttonText_fr": "Achetez maintenant", "buttonLink": "/products"}'),
    ('featured',
     'منتجات مميزة',
     'Produits en vedette',
     'اختيارنا الخاص لكِ',
     'Notre sélection spéciale pour vous',
     true,
     2,
     '{"limit": 8}'),
    ('new_arrivals',
     'وصل حديثاً',
     'Nouveautés',
     'أحدث المنتجات في متجرنا',
     'Les derniers produits dans notre boutique',
     true,
     3,
     '{"limit": 8}'),
    ('categories',
     'تسوقي حسب الفئة',
     'Achetez par catégorie',
     NULL,
     NULL,
     true,
     4,
     '{}'),
    ('offers',
     'عروض خاصة',
     'Offres spéciales',
     'لا تفوّتي هذه الفرص',
     'Ne manquez pas ces opportunités',
     true,
     5,
     '{"limit": 6}');


-- ============================================================================
-- Schema complete.
-- ============================================================================
