import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Server {
  id: string;
  name: string;
  url: string;
  environment: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface OAuthSettings {
  id: string;
  server_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  scope: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServerWithOAuth extends Server {
  oauth_settings: OAuthSettings | null;
}

export const serverApi = {
  async getServers(): Promise<Server[]> {
    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getServer(id: string): Promise<ServerWithOAuth | null> {
    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: oauthData } = await supabase
      .from('oauth_settings')
      .select('*')
      .eq('server_id', id)
      .maybeSingle();

    return {
      ...data,
      oauth_settings: oauthData,
    };
  },

  async createServer(server: Omit<Server, 'id' | 'created_at' | 'updated_at'>): Promise<Server> {
    const { data, error } = await supabase
      .from('servers')
      .insert([server])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateServer(id: string, updates: Partial<Omit<Server, 'id' | 'created_at' | 'updated_at'>>): Promise<Server> {
    const { data, error } = await supabase
      .from('servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteServer(id: string): Promise<void> {
    const { error } = await supabase
      .from('servers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getOAuthSettings(serverId: string): Promise<OAuthSettings | null> {
    const { data, error } = await supabase
      .from('oauth_settings')
      .select('*')
      .eq('server_id', serverId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createOAuthSettings(settings: Omit<OAuthSettings, 'id' | 'created_at' | 'updated_at'>): Promise<OAuthSettings> {
    const { data, error } = await supabase
      .from('oauth_settings')
      .insert([settings])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOAuthSettings(id: string, updates: Partial<Omit<OAuthSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<OAuthSettings> {
    const { data, error } = await supabase
      .from('oauth_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteOAuthSettings(id: string): Promise<void> {
    const { error } = await supabase
      .from('oauth_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
