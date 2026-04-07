-- Comprehensive RLS Update for Pro Ecommerce
-- Drop all existing functions first
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_staff();

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

-- Pro functions matching current schema (user_roles.role contains the role name)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ 
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ); 
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ 
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'manager')
  ); 
$$;

-- Drop all storage policies and recreate pro ones
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update images" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete images" ON storage.objects;
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Staff can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND public.is_staff());
CREATE POLICY "Staff can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND public.is_staff());
CREATE POLICY "Staff can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND public.is_staff());

-- User profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (public.is_staff());
    CREATE POLICY "Admin can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());
  END IF;
END;
$$;

-- User roles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admin can manage roles" ON public.user_roles;
    CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL USING (public.is_admin());
  END IF;
END;
$$;

-- Products
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;
    DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
    DROP POLICY IF EXISTS "Staff can view all products" ON public.products;
    DROP POLICY IF EXISTS "Staff can manage products" ON public.products;
    CREATE POLICY "Anyone can view published products" ON public.products FOR SELECT USING (published = true);
    CREATE POLICY "Staff can view all products" ON public.products FOR SELECT USING (public.is_staff());
    CREATE POLICY "Staff can manage products" ON public.products FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Product images
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'product_images'
  ) THEN
    ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
    DROP POLICY IF EXISTS "Staff can manage product images" ON public.product_images;
    CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
    CREATE POLICY "Staff can manage product images" ON public.product_images FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Carts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'carts'
  ) THEN
    ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
    CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);
  END IF;
END;
$$;

-- Cart items
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cart_items'
  ) THEN
    ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
    CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
      EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND (user_id = auth.uid() OR user_id IS NULL))
    );
  END IF;
END;
$$;

-- Categories
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'categories'
  ) THEN
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
    CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Staff can manage categories" ON public.categories;
    CREATE POLICY "Staff can manage categories" ON public.categories FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Product variants
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'product_variants'
  ) THEN
    ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view variants" ON public.product_variants;
    CREATE POLICY "Anyone can view variants" ON public.product_variants FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Staff can manage variants" ON public.product_variants;
    CREATE POLICY "Staff can manage variants" ON public.product_variants FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Product categories
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'product_categories'
  ) THEN
    ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view product categories" ON public.product_categories;
    CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Staff can manage product categories" ON public.product_categories;
    CREATE POLICY "Staff can manage product categories" ON public.product_categories FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Orders
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
    DROP POLICY IF EXISTS "Staff can manage all orders" ON public.orders;
    CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Staff can manage all orders" ON public.orders FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Order items (user insert + select own, staff all)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'order_items'
  ) THEN
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
    DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
    DROP POLICY IF EXISTS "Staff can manage order items" ON public.order_items;
    CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    );
    CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    );
    CREATE POLICY "Staff can manage order items" ON public.order_items FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Reviews (public approved, users create/update own, staff manage)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Staff can manage reviews" ON public.reviews;
    CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (approved = true);
    CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (user_id = auth.uid());
    CREATE POLICY "Staff can manage reviews" ON public.reviews FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Pro policies for remaining tables (staff manage, users own where applicable)
-- Addresses
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'addresses'
  ) THEN
    ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
    DROP POLICY IF EXISTS "Staff can view addresses" ON public.addresses;
    CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (user_id = auth.uid());
    CREATE POLICY "Staff can view all addresses" ON public.addresses FOR SELECT USING (public.is_staff());
  END IF;
END;
$$;

-- Inventory (staff only)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'inventory'
  ) THEN
    ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Staff can view inventory" ON public.inventory;
    DROP POLICY IF EXISTS "Staff can manage inventory" ON public.inventory;
    CREATE POLICY "Staff can view inventory" ON public.inventory FOR SELECT USING (public.is_staff());
    CREATE POLICY "Staff can manage inventory" ON public.inventory FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Payments (user own via order select, staff all)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
    DROP POLICY IF EXISTS "Staff can manage payments" ON public.payments;
    CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    );
    CREATE POLICY "Staff can manage payments" ON public.payments FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Coupons
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'coupons'
  ) THEN
    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
    DROP POLICY IF EXISTS "Staff can manage coupons" ON public.coupons;
    CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (active = true);
    CREATE POLICY "Staff can manage coupons" ON public.coupons FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Coupon redemptions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'coupon_redemptions'
  ) THEN
    ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own redemptions" ON public.coupon_redemptions;
    DROP POLICY IF EXISTS "Staff can manage redemptions" ON public.coupon_redemptions;
    CREATE POLICY "Users can view own redemptions" ON public.coupon_redemptions FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "Staff can manage redemptions" ON public.coupon_redemptions FOR ALL USING (public.is_staff());
  END IF;
END;
$$;

-- Roles are not part of the current schema; policies for user_roles.role are handled directly in functions.

-- Audit logs (admin view, system insert)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
    CREATE POLICY "Admin can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
    CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
  END IF;
END;
$$;

-- Settings (public view, admin manage)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'settings'
  ) THEN
    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
    DROP POLICY IF EXISTS "Admin can manage settings" ON public.settings;
    CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
    CREATE POLICY "Admin can manage settings" ON public.settings FOR ALL USING (public.is_admin());
  END IF;
END;
$$;

-- Media (public view, staff manage)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'media'
  ) THEN
    ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view media" ON public.media;
    DROP POLICY IF EXISTS "Staff can manage media" ON public.media;
    CREATE POLICY "Anyone can view media" ON public.media FOR SELECT USING (true);
    CREATE POLICY "Staff can manage media" ON public.media FOR ALL USING (public.is_staff());
  END IF;
END;
$$;
