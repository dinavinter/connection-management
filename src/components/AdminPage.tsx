import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Settings, CircleAlert as AlertCircle, Loader } from 'lucide-react';
import { type Server, type ServerWithOAuth, serverApi } from '../lib/servers';
import ServerForm from './ServerForm';
import OAuthSettingsForm from './OAuthSettingsForm';

export default function AdminPage() {
  const [servers, setServers] = useState<ServerWithOAuth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showServerForm, setShowServerForm] = useState(false);
  const [showOAuthForm, setShowOAuthForm] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string>('');

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const serverList = await serverApi.getServers();
      const serversWithOAuth = await Promise.all(
        serverList.map(async (server) => {
          const fullServer = await serverApi.getServer(server.id);
          return fullServer || { ...server, oauth_settings: null };
        })
      );
      setServers(serversWithOAuth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this server?')) return;

    try {
      await serverApi.deleteServer(id);
      setServers(servers.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete server');
    }
  };

  const handleEditServer = (server: ServerWithOAuth) => {
    setSelectedServer(server);
    setShowServerForm(true);
  };

  const handleConfigureOAuth = (server: ServerWithOAuth) => {
    setSelectedServerId(server.id);
    setShowOAuthForm(true);
  };

  const handleServerFormSuccess = () => {
    setShowServerForm(false);
    setSelectedServer(null);
    loadServers();
  };

  const handleOAuthFormSuccess = () => {
    setShowOAuthForm(false);
    setSelectedServerId('');
    loadServers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Developer Settings</h1>
            <p className="text-slate-600 mt-2">Manage servers and OAuth application settings</p>
          </div>
          <button
            onClick={() => {
              setSelectedServer(null);
              setShowServerForm(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Server</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="text-blue-600 animate-spin" />
          </div>
        ) : servers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Settings size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No servers configured</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first server</p>
            <button
              onClick={() => {
                setSelectedServer(null);
                setShowServerForm(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Server</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {servers.map((server) => (
              <div
                key={server.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-slate-900">{server.name}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {server.environment}
                        </span>
                        {server.oauth_settings?.is_enabled && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            OAuth Enabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-2 font-mono">{server.url}</p>
                      {server.description && (
                        <p className="text-sm text-slate-600 mt-2">{server.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditServer(server)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit server"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                        title="Delete server"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">OAuth Configuration</p>
                        <p className="text-xs text-slate-500">
                          {server.oauth_settings
                            ? `Client ID: ${server.oauth_settings.client_id.substring(0, 20)}...`
                            : 'No OAuth settings configured'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleConfigureOAuth(server)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <Settings size={16} />
                        <span>Configure</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showServerForm && (
        <ServerForm
          server={selectedServer || undefined}
          onSuccess={handleServerFormSuccess}
          onCancel={() => {
            setShowServerForm(false);
            setSelectedServer(null);
          }}
        />
      )}

      {showOAuthForm && (
        <OAuthSettingsForm
          serverId={selectedServerId}
          oauthSettings={
            servers.find((s) => s.id === selectedServerId)?.oauth_settings || undefined
          }
          onSuccess={handleOAuthFormSuccess}
          onCancel={() => {
            setShowOAuthForm(false);
            setSelectedServerId('');
          }}
        />
      )}
    </div>
  );
}
