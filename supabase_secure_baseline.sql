-- ==============================================================================
-- HARD REAL ESTATE & DEVELOPMENTS - SUPABASE POSTGRESQL MASTER SCHEMA & SEED
-- ==============================================================================

-- Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROPERTIES TABLE (Luxury Listings with Bilingual Data & Media)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price NUMERIC NOT NULL,
  price_prefix_en TEXT DEFAULT 'Guide Price',
  price_prefix_ar TEXT DEFAULT 'السعر التقديري',
  location_en TEXT NOT NULL,
  location_ar TEXT NOT NULL,
  city TEXT NOT NULL,
  district_en TEXT,
  district_ar TEXT,
  coordinates JSONB,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area_sqm NUMERIC NOT NULL,
  features_en TEXT[],
  features_ar TEXT[],
  images TEXT[] NOT NULL,
  floor_plans TEXT[],
  video_url TEXT,
  virtual_tour_url TEXT,
  is_exclusive BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. LEADS TABLE (Inquiries, Viewing Requests, Valuations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT ('LEAD-' || floor(100000 + random() * 900000)::TEXT),
  type TEXT NOT NULL DEFAULT 'property_inquiry',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'whatsapp',
  message TEXT,
  property_id TEXT,
  project_id TEXT,
  preferred_date DATE,
  preferred_time_slot TEXT,
  property_type TEXT,
  budget NUMERIC,
  crm_synced BOOLEAN DEFAULT false,
  crm_reference_id TEXT,
  source TEXT DEFAULT 'HARD Web Portal',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PROJECTS TABLE (Master Developments & Off-Plan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  location_en TEXT NOT NULL,
  location_ar TEXT NOT NULL,
  type_en TEXT NOT NULL,
  type_ar TEXT NOT NULL,
  status_en TEXT NOT NULL,
  status_ar TEXT NOT NULL,
  completion_date TEXT,
  units_count INTEGER,
  starting_price NUMERIC,
  image TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  features_en TEXT[],
  features_ar TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. BLOG POSTS TABLE (Market Insights & Real Estate Reports)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_ar TEXT,
  content_en TEXT,
  content_ar TEXT,
  author_en TEXT,
  author_ar TEXT,
  date TEXT,
  category_en TEXT,
  category_ar TEXT,
  read_time_en TEXT,
  read_time_ar TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TESTIMONIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  role_en TEXT,
  role_ar TEXT,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  property_type_en TEXT,
  property_type_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. SUBSCRIBERS TABLE (VIP Access & Newsletter)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);


-- Baseline is private until authentication and publication workflows are connected.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['properties','leads','projects','blog_posts','testimonials','subscribers'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', t);
  END LOOP;
END $$;

