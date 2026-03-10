/*
  # Add identity providers and destination servers

  1. New Tables
    - `identity_providers` - Pre-configured identity provider templates
      - `id` (uuid, primary key)
      - `name` (text) - Provider name (e.g., "Okta", "Azure AD", "Auth0")
      - `authorization_endpoint` (text)
      - `token_endpoint` (text)
      - `default_scope` (text)
      - `created_at` (timestamptz)
    
    - `oauth_destinations` - Maps OAuth settings to destination servers
      - `id` (uuid, primary key)
      - `oauth_setting_id` (uuid, foreign key) - References oauth_settings
      - `destination_server_id` (uuid, foreign key) - References servers (destination)
      - `created_at` (timestamptz)

  2. Schema Changes
    - Add `identity_provider_id` column to oauth_settings for quick reference
    - Add `is_identity_provider` boolean to servers to mark identity provider servers

  3. Security
    - Enable RLS on new tables
*/

CREATE TABLE IF NOT EXISTS identity_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  authorization_endpoint text NOT NULL,
  token_endpoint text NOT NULL,
  default_scope text DEFAULT 'openid profile email',
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'oauth_settings' AND column_name = 'identity_provider_id'
  ) THEN
    ALTER TABLE oauth_settings ADD COLUMN identity_provider_id uuid REFERENCES identity_providers(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'servers' AND column_name = 'is_identity_provider'
  ) THEN
    ALTER TABLE servers ADD COLUMN is_identity_provider boolean DEFAULT false;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS oauth_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oauth_setting_id uuid NOT NULL REFERENCES oauth_settings(id) ON DELETE CASCADE,
  destination_server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(oauth_setting_id, destination_server_id)
);

ALTER TABLE identity_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view identity providers"
  ON identity_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create identity providers"
  ON identity_providers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update identity providers"
  ON identity_providers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete identity providers"
  ON identity_providers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can view oauth destinations"
  ON oauth_destinations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create oauth destinations"
  ON oauth_destinations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete oauth destinations"
  ON oauth_destinations FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO identity_providers (name, authorization_endpoint, token_endpoint, default_scope)
VALUES 
  ('Okta', 'https://your-domain.okta.com/oauth2/v1/authorize', 'https://your-domain.okta.com/oauth2/v1/token', 'openid profile email'),
  ('Azure AD', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', 'https://login.microsoftonline.com/common/oauth2/v2.0/token', 'openid profile email offline_access'),
  ('Auth0', 'https://your-domain.auth0.com/authorize', 'https://your-domain.auth0.com/oauth/token', 'openid profile email'),
  ('Google', 'https://accounts.google.com/o/oauth2/v2/auth', 'https://oauth2.googleapis.com/token', 'openid profile email'),
  ('GitHub', 'https://github.com/login/oauth/authorize', 'https://github.com/login/oauth/access_token', 'user:email')
ON CONFLICT (name) DO NOTHING;