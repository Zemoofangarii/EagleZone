export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at?: string;
  role?: Role;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  seo_title?: string;
  seo_description?: string;
  published: boolean;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  categories?: Category[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  title?: string;
  price?: number;
  compare_at_price?: number;
  attributes?: Record<string, unknown>;
  position?: number;
  created_at?: string;
  updated_at?: string;
  inventory?: Inventory[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  position?: number;
  created_at?: string;
}

export interface Inventory {
  id: string;
  variant_id: string;
  quantity: number;
  reserved: number;
  location?: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  user_id?: string;
  type?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  created_at?: string;
  updated_at?: string;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at?: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency?: string;
  shipping_address?: Address;
  billing_address?: Address;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  title: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id?: string;
  status: string;
  amount: number;
  currency?: string;
  provider_payload?: Record<string, unknown>;
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count?: number;
  expires_at?: string;
  active: boolean;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  verified_purchase?: boolean;
  approved?: boolean;
  created_at?: string;
  user?: UserProfile;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_role?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at?: string;
}

export interface Setting {
  key: string;
  value: unknown;
  updated_at?: string;
}

export interface Media {
  id: string;
  url: string;
  filename?: string;
  mime_type?: string;
  size?: number;
  alt_text?: string;
  folder?: string;
  uploaded_by?: string;
  created_at?: string;
}
