-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'customer');

-- Roles table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES 
  ('admin', 'Full system access'),
  ('manager', 'Product and order management'),
  ('customer', 'Regular customer');

-- User profiles (links to auth.users)
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User roles join table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid REFERENCES public.categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(12,2),
  currency text DEFAULT 'USD',
  metadata jsonb DEFAULT '{}'::jsonb,
  seo_title text,
  seo_description text,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product categories (many-to-many)
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(product_id, category_id)
);

-- Product variants
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku text,
  title text,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  attributes jsonb DEFAULT '{}'::jsonb,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  alt_text text,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Inventory
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  reserved int NOT NULL DEFAULT 0,
  location text,
  updated_at timestamptz DEFAULT now()
);

-- Addresses
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type text DEFAULT 'shipping',
  first_name text,
  last_name text,
  company text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Carts
CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart items
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id uuid REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id uuid REFERENCES public.product_variants(id),
  quantity int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id),
  status text DEFAULT 'pending',
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) DEFAULT 0,
  shipping numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  title text NOT NULL,
  sku text,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  total numeric(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  provider_payment_id text,
  status text DEFAULT 'pending',
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  provider_payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'percentage',
  value numeric(12,2) NOT NULL,
  min_order_amount numeric(12,2),
  max_uses int,
  used_count int DEFAULT 0,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Coupon redemptions
CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id),
  order_id uuid REFERENCES public.orders(id),
  redeemed_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  verified_purchase boolean DEFAULT false,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Audit logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id uuid,
  actor_role text,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Settings (key-value store)
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Media library
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text NOT NULL,
  filename text,
  mime_type text,
  size int,
  alt_text text,
  folder text,
  uploaded_by uuid REFERENCES public.user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- =====================
-- SECURITY FUNCTIONS
-- =====================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(p_user_id uuid, p_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = p_role
  );
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Check if current user is admin or manager
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager');
$$;

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_role_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign customer role by default
  SELECT id INTO customer_role_id FROM public.roles WHERE name = 'customer';
  IF customer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id) VALUES (NEW.id, customer_role_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================
-- ORDER NUMBER GENERATOR
-- =====================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- =====================
-- RLS POLICIES
-- =====================

-- User profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON public.user_profiles FOR SELECT USING (public.is_staff());
CREATE POLICY "Admin can manage all profiles" ON public.user_profiles FOR ALL USING (public.is_admin());

-- User roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published products" ON public.products FOR SELECT USING (published = true);
CREATE POLICY "Staff can view all products" ON public.products FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff can manage products" ON public.products FOR ALL USING (public.is_staff());

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Staff can manage categories" ON public.categories FOR ALL USING (public.is_staff());

-- Product categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Staff can manage product categories" ON public.product_categories FOR ALL USING (public.is_staff());

-- Product variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Staff can manage variants" ON public.product_variants FOR ALL USING (public.is_staff());

-- Product images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Staff can manage images" ON public.product_images FOR ALL USING (public.is_staff());

-- Inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view inventory" ON public.inventory FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff can manage inventory" ON public.inventory FOR ALL USING (public.is_staff());

-- Addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Staff can view addresses" ON public.addresses FOR SELECT USING (public.is_staff());

-- Carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

-- Cart items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff can manage all orders" ON public.orders FOR ALL USING (public.is_staff());

-- Order items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Staff can manage order items" ON public.order_items FOR ALL USING (public.is_staff());

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Staff can manage payments" ON public.payments FOR ALL USING (public.is_staff());

-- Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Staff can manage coupons" ON public.coupons FOR ALL USING (public.is_staff());

-- Coupon redemptions
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions" ON public.coupon_redemptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff can manage redemptions" ON public.coupon_redemptions FOR ALL USING (public.is_staff());

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (approved = true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Staff can manage reviews" ON public.reviews FOR ALL USING (public.is_staff());

-- Audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON public.settings FOR ALL USING (public.is_admin());

-- Media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Staff can manage media" ON public.media FOR ALL USING (public.is_staff());

-- Roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Admin can manage roles" ON public.roles FOR ALL USING (public.is_admin());

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_published ON public.products(published);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);