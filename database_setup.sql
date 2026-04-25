-- Create the scans table for SecureAxis
-- Execute this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL,
  total INTEGER NOT NULL,
  alive INTEGER,
  subdomains JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scans_domain ON scans(domain);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);

-- Optional: Disable RLS if you want simple access
-- ALTER TABLE scans DISABLE ROW LEVEL SECURITY;

-- OR enable RLS with a permissive policy:
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on scans" ON scans
FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON scans TO anon;
GRANT ALL ON scans TO authenticated;
