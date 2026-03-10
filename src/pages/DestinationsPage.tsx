import { useState, useEffect } from 'react';
import { CircleAlert as AlertCircle, Loader } from 'lucide-react';
import { type ServerWithOAuth, serverApi } from '../lib/servers';

export default function DestinationsPage() {
  const [servers, setServers] = useState<ServerWithOAuth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServersWithDestinations();
  }, []);

  const loadServersWithDestinations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const serverList = await serverApi.getServers();
      const serversWithOAuth = await Promise.all(
        serverList.map(async (server) => {
          const fullServer = await serverApi.getServer(server.id);
          return fullServer || { ...server, oauth_settings: null, oauth_destinations: [] };
        })
      );
      setServers(serversWithOAuth.filter((s) => s.oauth_settings?.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">OAuth Destination Mappings</h2>
        <p className="text-slate-600 mt-2">View which servers are configured as destination OAuth providers</p>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12 mt-8">
          <Loader size={32} className="text-blue-600 animate-spin" />
        </div>
      ) : servers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No OAuth configurations</h3>
          <p className="text-slate-600">Configure OAuth on servers to set up destination mappings</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{server.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{server.environment}</p>
                {server.oauth_settings?.identity_provider_id && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">Uses Identity Provider Template</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Destination Servers ({server.oauth_destinations?.length || 0})</p>
                {server.oauth_destinations && server.oauth_destinations.length > 0 ? (
                  <div className="space-y-2">
                    {server.oauth_destinations.map((dest) => {
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
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Linked
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No destination servers configured</p>
                )}
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4">
                <p className="text-xs text-slate-600">
                  <span className="font-medium">OAuth Client ID:</span>{' '}
                  {server.oauth_settings?.client_id.substring(0, 16)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
