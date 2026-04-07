-- Add all potentially missing columns to the products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price numeric(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
