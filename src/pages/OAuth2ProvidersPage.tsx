import { useState, useEffect } from 'react';
import { Plus, Trash2, CircleAlert as AlertCircle, Loader, Copy } from 'lucide-react';
import { type IdentityProvider, serverApi } from '../lib/servers';

export default function OAuth2ProvidersPage() {
  const [providers, setProviders] = useState<IdentityProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    authorization_endpoint: '',
    token_endpoint: '',
    default_scope: 'openid profile email',
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await serverApi.getIdentityProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.authorization_endpoint || !formData.token_endpoint) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const { data, error: insertError } = await serverApi.supabase
        .from('identity_providers')
        .insert([formData])
        .select()
        .single();

      if (insertError) throw insertError;

      setProviders([...providers, data]);
      setFormData({
        name: '',
        authorization_endpoint: '',
        token_endpoint: '',
        default_scope: 'openid profile email',
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add provider');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) return;

    try {
      const { error: deleteError } = await serverApi.supabase
        .from('identity_providers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setProviders(providers.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">OAuth2 Providers</h2>
          <p className="text-slate-600 mt-2">Manage identity provider templates</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Provider</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size={32} className="text-blue-600 animate-spin" />
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No providers configured</h3>
          <p className="text-slate-600 mb-6">Create your first identity provider template</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{provider.name}</h3>
                <button
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="p-2 hover:bg-red-100 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                  title="Delete provider"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                    Authorization Endpoint
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-slate-50 p-2 rounded font-mono text-slate-700 overflow-auto">
                      {provider.authorization_endpoint}
                    </code>
                    <button
                      onClick={() => handleCopy(provider.authorization_endpoint, `auth-${provider.id}`)}
                      className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                      title="Copy"
                    >
                      {copiedId === `auth-${provider.id}` ? (
                        <span className="text-xs text-green-600 font-medium">Copied</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                    Token Endpoint
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-slate-50 p-2 rounded font-mono text-slate-700 overflow-auto">
                      {provider.token_endpoint}
                    </code>
                    <button
                      onClick={() => handleCopy(provider.token_endpoint, `token-${provider.id}`)}
                      className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                      title="Copy"
                    >
                      {copiedId === `token-${provider.id}` ? (
                        <span className="text-xs text-green-600 font-medium">Copied</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                    Default Scope
                  </p>
                  <p className="text-sm text-slate-700 font-mono bg-slate-50 p-2 rounded">
                    {provider.default_scope}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Add Identity Provider</h2>
            </div>

            <form onSubmit={handleAddProvider} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Provider Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Custom OAuth Provider"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Authorization Endpoint *
                </label>
                <input
                  type="url"
                  value={formData.authorization_endpoint}
                  onChange={(e) => setFormData({ ...formData, authorization_endpoint: e.target.value })}
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
                  value={formData.token_endpoint}
                  onChange={(e) => setFormData({ ...formData, token_endpoint: e.target.value })}
                  placeholder="https://example.com/oauth/token"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Scope
                </label>
                <input
                  type="text"
                  value={formData.default_scope}
                  onChange={(e) => setFormData({ ...formData, default_scope: e.target.value })}
                  placeholder="openid profile email"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
