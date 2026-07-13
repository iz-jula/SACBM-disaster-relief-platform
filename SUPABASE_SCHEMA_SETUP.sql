-- ============================================
-- SUPABASE SCHEMA SETUP
-- ============================================
-- Run these SQL commands in your Supabase SQL Editor
-- https://app.supabase.com/project/[your-project-id]/sql/new

-- ============================================
-- 1. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
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
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for sorting
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(date DESC);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);

-- ============================================
-- 2. CAROUSEL_IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.carousel_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  location TEXT DEFAULT 'moments_of_impact',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on location for filtering
CREATE INDEX IF NOT EXISTS carousel_images_location_idx ON public.carousel_images(location);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS carousel_images_order_idx ON public.carousel_images(display_order);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES (Allow public read, authenticated write)
-- ============================================

-- Events: Allow anyone to read
CREATE POLICY "Allow public read access" ON public.events
  FOR SELECT
  USING (true);

-- Events: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Events: Allow authenticated users to update their own events
CREATE POLICY "Allow authenticated update" ON public.events
  FOR UPDATE TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Events: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON public.events
  FOR DELETE TO authenticated
  USING (auth.role() = 'authenticated');

-- Carousel Images: Allow anyone to read
CREATE POLICY "Allow public read access" ON public.carousel_images
  FOR SELECT
  USING (true);

-- Carousel Images: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON public.carousel_images
  FOR INSERT TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Carousel Images: Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON public.carousel_images
  FOR UPDATE TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Carousel Images: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON public.carousel_images
  FOR DELETE TO authenticated
  USING (auth.role() = 'authenticated');

-- ============================================
-- 5. STORAGE BUCKETS
-- ============================================
-- Create buckets via Supabase UI:
-- 1. Go to Storage section
-- 2. Create new bucket "events-images" (public)
-- 3. Create new bucket "carousel-images" (public)

-- Note: Storage buckets cannot be created via SQL.
-- Please create them manually in Supabase Storage section.

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify tables were created:
-- SELECT * FROM public.events LIMIT 1;
-- SELECT * FROM public.carousel_images LIMIT 1;
