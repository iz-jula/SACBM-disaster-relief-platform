-- SUPABASE DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor to create all necessary tables

-- ============================================
-- 1. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  attendees INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  help_needs JSONB DEFAULT '[]'::jsonb,
  contact_message TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- ============================================
-- 2. COVER IMAGES TABLE (for Hero/Background Images)
-- ============================================
CREATE TABLE IF NOT EXISTS cover_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  page TEXT NOT NULL, -- e.g., 'home', 'dashboard'
  image_type TEXT NOT NULL, -- e.g., 'hero', 'background', 'carousel'
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cover_images_page ON cover_images(page);
CREATE INDEX IF NOT EXISTS idx_cover_images_active ON cover_images(active);

-- ============================================
-- 3. MEMBERS INFO TABLE (for Members Section Data)
-- ============================================
CREATE TABLE IF NOT EXISTS members_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_email TEXT,
  company_phone TEXT,
  company_website TEXT,
  logo_url TEXT,
  description TEXT,
  sector TEXT,
  location TEXT,
  ceo_name TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_members_info_company_name ON members_info(company_name);
CREATE INDEX IF NOT EXISTS idx_members_info_featured ON members_info(featured);
CREATE INDEX IF NOT EXISTS idx_members_info_active ON members_info(active);

-- ============================================
-- STORAGE BUCKETS SETUP INSTRUCTIONS
-- ============================================
-- You need to create these buckets in Supabase Storage:
-- 
-- 1. Create bucket: "events-images"
--    - Make it PUBLIC
--    - This will store event main images and gallery
-- 
-- 2. Create bucket: "cover-images"
--    - Make it PUBLIC
--    - This will store hero/background images
-- 
-- 3. Create bucket: "members-logos"
--    - Make it PUBLIC
--    - This will store company logos and member images
--
-- After creating buckets, set these CORS policies:
-- - Allowed origins: "*"
-- - Allowed methods: GET, POST, PUT, DELETE, HEAD
-- - Allowed headers: "*"

-- ============================================
-- ROW LEVEL SECURITY (Optional but Recommended)
-- ============================================
-- Enable RLS on tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE members_info ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cover_images FOR SELECT USING (active = true);
CREATE POLICY "Allow public read" ON members_info FOR SELECT USING (active = true);

-- Allow authenticated users (admins) to manage content
CREATE POLICY "Allow authenticated admin insert" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated admin update" ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated admin delete" ON events FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated admin insert" ON cover_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated admin update" ON cover_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated admin delete" ON cover_images FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated admin insert" ON members_info FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated admin update" ON members_info FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated admin delete" ON members_info FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- STEPS TO COMPLETE
-- ============================================
-- 1. Copy and paste the SQL above into your Supabase SQL Editor
-- 2. Create the following storage buckets:
--    - events-images (PUBLIC)
--    - cover-images (PUBLIC)
--    - members-logos (PUBLIC)
-- 3. Your application will now be able to read/write to these tables
-- 4. Update your environment variables if needed
