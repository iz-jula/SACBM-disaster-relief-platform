# Setup Instructions - Events & Carousel System

## Problem
The events and carousel image systems aren't working because the required Supabase database tables don't exist yet.

## Solution
You need to create the database tables in Supabase. Follow these steps:

### Step 1: Go to Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Setup SQL
1. Copy all the SQL from `SUPABASE_SCHEMA_SETUP.sql`
2. Paste it into the Supabase SQL editor
3. Click "Run" button (green play icon)

You should see: "Success. No rows returned" after a few seconds.

### Step 3: Create Storage Buckets
1. Go to **Storage** in Supabase left sidebar
2. Click **Create a new bucket**
3. Name it: `events-images` and make it **Public**
4. Click **Create bucket**
5. Repeat for: `carousel-images` (also Public)

### Step 4: Test in Admin Panel
1. Go to your admin dashboard
2. Click on "Events" section
3. Try creating a new event:
   - The **Date** input will now be a date picker (click the field)
   - The **Time** input will be a time picker
   - Save the event - it should now work!

### Step 5: Test Carousel Upload
1. Go to **Uploaded Media** section in admin
2. Upload an image with location "Hero Background (Behind Stats)"
3. Go to the home page - the image should appear behind the stats cards

## What Was Fixed

### 1. **Date and Time Inputs** ✓
- Changed from plain text inputs to proper date/time pickers
- Date picker: `type="date"` (format: YYYY-MM-DD)
- Time picker: `type="time"` (format: HH:MM)
- The system now correctly identifies upcoming vs past events based on date

### 2. **Supabase Tables** (Need to create)
- **events** table: Stores all event data with proper schema
- **carousel_images** table: Stores images with location field for hero background, moments of impact, etc.

### 3. **Storage Buckets** (Need to create)
- **events-images**: For event main images and galleries
- **carousel-images**: For carousel/hero background images

## How the System Works Now

### Creating Events
1. Admin goes to Events section
2. Clicks "New Event"
3. Fills in with proper date/time pickers
4. The system automatically knows:
   - Is it upcoming? (date > today)
   - Is it past? (date < today)
5. Saves to Supabase `events` table

### Carousel Images
1. Admin goes to Uploaded Media section
2. Selects location (Hero Background, Moments of Impact, etc.)
3. Uploads image
4. Image is stored with location tag
5. Home page loads images by location automatically

## Database Schema

### events table
```
- id (UUID) - unique identifier
- title - event name
- date - date in YYYY-MM-DD format
- time - start time in HH:MM format
- location - event location
- description - event details
- category - event type
- featured - show on dashboard?
- help_needs - what members can help with (JSON)
- contact_message - how to contact organizers
- image - main event image URL
- gallery - array of gallery image URLs
```

### carousel_images table
```
- id (UUID) - unique identifier
- url - image URL in storage
- title - image title
- description - image caption
- location - where to display (hero_background, moments_of_impact, gallery)
- display_order - sort order in carousel
```

## Troubleshooting

### "Could not find the table 'public.events'"
- You haven't run the SQL setup yet
- Follow Step 2 above

### "Column carousel_images.location does not exist"
- You haven't run the SQL setup yet
- The location column is added in the SQL file

### Images not uploading
- Make sure storage buckets are created (Step 3)
- Buckets must be **Public** (not private)

### Date not working properly
- Make sure you're using the date picker, not typing
- Date should be in YYYY-MM-DD format

## Questions?
If something doesn't work:
1. Check the browser console for error messages
2. Check Supabase SQL Editor for any errors
3. Verify the storage buckets are **Public**, not private
