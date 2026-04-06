/*
  # EthnoTrace AI Database Schema

  ## Overview
  This migration creates the core database schema for EthnoTrace AI platform,
  enabling artisans and farmers to track materials, products, ESG metrics, and sales.

  ## New Tables

  ### 1. `artisans`
  Stores information about registered artisans and craftspeople
  - `id` (uuid, primary key) - Unique identifier
  - `email` (text, unique) - Contact email
  - `name` (text) - Full name
  - `location` (text) - Geographic location
  - `cooperative` (text) - Associated cooperative name
  - `created_at` (timestamptz) - Registration timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `materials`
  Tracks scanned raw materials with AI-generated data
  - `id` (uuid, primary key) - Unique identifier
  - `artisan_id` (uuid, foreign key) - Reference to artisan
  - `name` (text) - Material name
  - `type` (text) - Category (bio, agro, craft)
  - `composition` (jsonb) - AI-analyzed composition data
  - `quality_score` (integer) - AI quality assessment (0-100)
  - `origin` (text) - Source/origin information
  - `scan_image_url` (text) - Reference to scan image
  - `digital_passport` (jsonb) - Complete material passport data
  - `created_at` (timestamptz) - Scan timestamp

  ### 3. `products`
  Stores products created from materials
  - `id` (uuid, primary key) - Unique identifier
  - `artisan_id` (uuid, foreign key) - Reference to artisan
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `category` (text) - Product category
  - `price` (decimal) - Selling price
  - `status` (text) - Status (draft, listed, in_production, sold)
  - `design_data` (jsonb) - AI-generated design specifications
  - `materials_used` (jsonb) - Array of material references
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `esg_reports`
  Tracks ESG metrics for each product
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid, foreign key) - Reference to product
  - `carbon_footprint` (decimal) - CO2 emissions (kg)
  - `water_usage` (decimal) - Water consumption (liters)
  - `waste_reduction` (decimal) - Waste reduction percentage
  - `sustainability_score` (integer) - Overall score (0-100)
  - `certification_status` (text) - Certification level
  - `report_data` (jsonb) - Complete ESG report
  - `generated_at` (timestamptz) - Report generation timestamp

  ### 5. `transactions`
  Records sales and payment distributions
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid, foreign key) - Reference to product
  - `artisan_id` (uuid, foreign key) - Reference to artisan
  - `amount` (decimal) - Total transaction amount
  - `artisan_share` (decimal) - Amount to artisan
  - `supplier_share` (decimal) - Amount to suppliers
  - `platform_fee` (decimal) - Platform commission
  - `status` (text) - Transaction status
  - `created_at` (timestamptz) - Transaction timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated artisans to manage their own data
*/

CREATE TABLE IF NOT EXISTS artisans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  location text DEFAULT '',
  cooperative text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  composition jsonb DEFAULT '{}'::jsonb,
  quality_score integer DEFAULT 0,
  origin text DEFAULT '',
  scan_image_url text DEFAULT '',
  digital_passport jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  price decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft',
  design_data jsonb DEFAULT '{}'::jsonb,
  materials_used jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS esg_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  carbon_footprint decimal(10,2) DEFAULT 0,
  water_usage decimal(10,2) DEFAULT 0,
  waste_reduction decimal(5,2) DEFAULT 0,
  sustainability_score integer DEFAULT 0,
  certification_status text DEFAULT 'pending',
  report_data jsonb DEFAULT '{}'::jsonb,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  artisan_id uuid REFERENCES artisans(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  artisan_share decimal(10,2) DEFAULT 0,
  supplier_share decimal(10,2) DEFAULT 0,
  platform_fee decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can view own profile"
  ON artisans FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Artisans can update own profile"
  ON artisans FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Artisans can view own materials"
  ON materials FOR SELECT
  TO authenticated
  USING (artisan_id = auth.uid());

CREATE POLICY "Artisans can insert own materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (artisan_id = auth.uid());

CREATE POLICY "Artisans can update own materials"
  ON materials FOR UPDATE
  TO authenticated
  USING (artisan_id = auth.uid())
  WITH CHECK (artisan_id = auth.uid());

CREATE POLICY "Artisans can delete own materials"
  ON materials FOR DELETE
  TO authenticated
  USING (artisan_id = auth.uid());

CREATE POLICY "Artisans can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (artisan_id = auth.uid());

CREATE POLICY "Artisans can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (artisan_id = auth.uid());

CREATE POLICY "Artisans can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (artisan_id = auth.uid())
  WITH CHECK (artisan_id = auth.uid());

CREATE POLICY "Artisans can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (artisan_id = auth.uid());

CREATE POLICY "Artisans can view own ESG reports"
  ON esg_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = esg_reports.product_id
      AND products.artisan_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can insert ESG reports for own products"
  ON esg_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = esg_reports.product_id
      AND products.artisan_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (artisan_id = auth.uid());

CREATE POLICY "Artisans can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (artisan_id = auth.uid());