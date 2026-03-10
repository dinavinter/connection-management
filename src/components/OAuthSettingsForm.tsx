import { useState, useEffect } from 'react';
import { X, ChevronRight, CircleAlert as AlertCircle, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { type OAuthSettings, type IdentityProvider, type Server, type OAuthDestination, serverApi } from '../lib/servers';

interface OAuthSettingsFormProps {
  serverId: string;
  oauthSettings?: OAuthSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OAuthSettingsForm({
  serverId,
  oauthSettings,
  onSuccess,
  onCancel,
}: OAuthSettingsFormProps) {
  const [clientId, setClientId] = useState(oauthSettings?.client_id || '');
  const [clientSecret, setClientSecret] = useState(oauthSettings?.client_secret || '');
  const [redirectUri, setRedirectUri] = useState(oauthSettings?.redirect_uri || '');
  const [authEndpoint, setAuthEndpoint] = useState(oauthSettings?.authorization_endpoint || '');
  const [tokenEndpoint, setTokenEndpoint] = useState(oauthSettings?.token_endpoint || '');
  const [scope, setScope] = useState(oauthSettings?.scope || 'openid profile email');
  const [isEnabled, setIsEnabled] = useState(oauthSettings?.is_enabled || false);
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [identityProviders, setIdentityProviders] = useState<IdentityProvider[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedIdentityProvider, setSelectedIdentityProvider] = useState(oauthSettings?.identity_provider_id || '');
  const [destinations, setDestinations] = useState<OAuthDestination[]>([]);
  const [selectedDestinationServer, setSelectedDestinationServer] = useState('');
  const [isRawMode, setIsRawMode] = useState(!oauthSettings?.identity_provider_id);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (oauthSettings?.id) {
      loadDestinations();
    }
  }, [oauthSettings?.id]);

  const loadData = async () => {
    try {
      const [providers, serversList] = await Promise.all([
        serverApi.getIdentityProviders(),
        serverApi.getServers(),
      ]);
      setIdentityProviders(providers);
      setServers(serversList.filter((s) => !s.is_identity_provider && s.id !== serverId));
    } catch (err) {
      console.error('Failed to load providers and servers:', err);
    }
  };

  const loadDestinations = async () => {
    if (!oauthSettings?.id) return;
    try {
      const dest = await serverApi.getOAuthDestinations(oauthSettings.id);
      setDestinations(dest);
    } catch (err) {
      console.error('Failed to load destinations:', err);
    }
  };

  const handleAddDestination = async () => {
    if (!selectedDestinationServer || !oauthSettings?.id) return;
    try {
      const newDest = await serverApi.addOAuthDestination(oauthSettings.id, selectedDestinationServer);
      setDestinations([...destinations, newDest]);
      setSelectedDestinationServer('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add destination');
    }
  };

  const handleRemoveDestination = async (destinationId: string) => {
    try {
      await serverApi.removeOAuthDestination(destinationId);
      setDestinations(destinations.filter((d) => d.id !== destinationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove destination');
    }
  };

  const handleIdentityProviderChange = (providerId: string) => {
    setSelectedIdentityProvider(providerId);
    const provider = identityProviders.find((p) => p.id === providerId);
    if (provider) {
      setAuthEndpoint(provider.authorization_endpoint);
      setTokenEndpoint(provider.token_endpoint);
      setScope(provider.default_scope);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!clientId || !clientSecret || !redirectUri || !authEndpoint || !tokenEndpoint) {
        setError('Please fill in all required fields');
        return;
      }

      const settingsData = {
        server_id: serverId,
        identity_provider_id: !isRawMode ? selectedIdentityProvider || undefined : undefined,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        authorization_endpoint: authEndpoint,
        token_endpoint: tokenEndpoint,
        scope,
        is_enabled: isEnabled,
      };

      if (oauthSettings?.id) {
        await serverApi.updateOAuthSettings(oauthSettings.id, settingsData);
      } else {
        await serverApi.createOAuthSettings(settingsData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save OAuth settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-slate-900">
            {oauthSettings ? 'Edit OAuth Settings' : 'Configure OAuth'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex space-x-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setIsRawMode(false)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                !isRawMode
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Use Identity Provider
            </button>
            <button
              type="button"
              onClick={() => setIsRawMode(true)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                isRawMode
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Settings
            </button>
          </div>

          {!isRawMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Identity Provider *
                </label>
                <select
                  value={selectedIdentityProvider}
                  onChange={(e) => handleIdentityProviderChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a provider...</option>
                  {identityProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Endpoints will be auto-populated based on your selection. You can still customize them if needed.
                </p>
              </div>
            </>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client ID *
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Your OAuth application client ID"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client Secret *
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Your OAuth application client secret"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Redirect URI *
            </label>
            <input
              type="url"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder="https://example.com/callback"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Authorization Endpoint *
              </label>
              <input
                type="url"
                value={authEndpoint}
                onChange={(e) => setAuthEndpoint(e.target.value)}
                placeholder="https://example.com/oauth/authorize"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Token Endpoint *
              </label>
              <input
                type="url"
                value={tokenEndpoint}
                onChange={(e) => setTokenEndpoint(e.target.value)}
                placeholder="https://example.com/oauth/token"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Scope
            </label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="openid profile email"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Space-separated OAuth scopes</p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg">
            <input
              type="checkbox"
              id="isEnabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isEnabled" className="text-sm font-medium text-slate-700 cursor-pointer">
              Enable OAuth for this server
            </label>
          </div>

          {oauthSettings?.id && (
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Destination Servers</h3>
              <p className="text-xs text-slate-600 mb-4">
                Select which servers can use this OAuth configuration as an identity provider
              </p>

              {destinations.length > 0 && (
                <div className="space-y-2 mb-4">
                  {destinations.map((dest) => {
                    const destServer = servers.find((s) => s.id === dest.destination_server_id);
                    return (
                      <div
                        key={dest.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{destServer?.name}</p>
                          <p className="text-xs text-slate-500">{destServer?.environment}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDestination(dest.id)}
                          className="p-2 hover:bg-red-100 rounded text-slate-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <select
                  value={selectedDestinationServer}
                  onChange={(e) => setSelectedDestinationServer(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Add destination server...</option>
                  {servers
                    .filter((s) => !destinations.some((d) => d.destination_server_id === s.id))
                    .map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.name} ({server.environment})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddDestination}
                  disabled={!selectedDestinationServer}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Saving...' : 'Save OAuth Settings'}</span>
              {!isLoading && <ChevronRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
