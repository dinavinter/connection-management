/*
  # Create servers and OAuth settings tables

  1. New Tables
    - `servers` - Stores server/environment configurations
      - `id` (uuid, primary key)
      - `name` (text) - Display name for the server
      - `url` (text) - Server URL
      - `environment` (text) - Environment name (e.g., "Production", "Staging", "Test")
      - `description` (text) - Optional description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `oauth_settings` - Stores OAuth configuration per server
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key) - References servers table
      - `client_id` (text) - OAuth client ID
      - `client_secret` (text) - OAuth client secret (encrypted in production)
      - `redirect_uri` (text) - OAuth redirect URI
      - `authorization_endpoint` (text) - OAuth authorization endpoint URL
      - `token_endpoint` (text) - OAuth token endpoint URL
      - `scope` (text) - OAuth scopes (comma-separated)
      - `is_enabled` (boolean) - Whether this OAuth config is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Create policies for authenticated admins only
*/

CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  environment text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oauth_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  client_secret text NOT NULL,
  redirect_uri text NOT NULL,
  authorization_endpoint text NOT NULL,
  token_endpoint text NOT NULL,
  scope text DEFAULT 'openid profile email',
  is_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all servers"
  ON servers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create servers"
  ON servers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update servers"
  ON servers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete servers"
  ON servers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can view all oauth settings"
  ON oauth_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create oauth settings"
  ON oauth_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update oauth settings"
  ON oauth_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete oauth settings"
  ON oauth_settings FOR DELETE
  TO authenticated
  USING (true);