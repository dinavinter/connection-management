import { useState } from 'react';
import { X, ChevronRight, Shield, Lock, CheckCircle } from 'lucide-react';
import { mockAccounts, type Account, type System } from '../lib/accounts';
import { useArray } from '../lib/yjs.store';

interface ConnectSystemFlowProps {
  onClose: () => void;
}

interface Connection {
  id: string;
  name: string;
  icon: string;
  url: string;
  type: string;
  environment: string;
  isEnabled: boolean;
  accessMode: 'readonly' | 'edit';
}

export default function ConnectSystemFlow({ onClose }: ConnectSystemFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [username, setUsername] = useState('tomer@sap.com');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const [, pushConnection] = useArray<Connection>('connections');

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
      setStep(3);
    
  };

  const handleGrantAccessAndConnect = () => {
    if (!selectedAccount) return;

    setIsConnecting(true);

    selectedAccount.systems.forEach((system: System) => {
      const connection: Connection = {
        id: `${selectedAccount.environment}-${system.id}`,
        name: system.name,
        icon: system.icon,
        url: system.url,
        type: system.type,
        environment: selectedAccount.environment,
        isEnabled: false,
        accessMode: selectedAccount.environment === 'Test' ? 'edit' : 'readonly',
      };

      pushConnection(connection);
    });

    setTimeout(() => {
      setIsConnecting(false);
      onClose();
    }, 1500);
  };

  const uniqueEnvironments = Array.from(
    new Map(mockAccounts.map(acc => [acc.environment, acc])).values()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Connect New Environment</h2>
            <div className="flex items-center space-x-2 mt-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    s < step ? 'bg-green-500 text-white' :
                    s === step ? 'bg-blue-600 text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {s < step ? <CheckCircle size={14} /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-green-500' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Environment</h3>
              <p className="text-sm text-slate-600 mb-4">Choose the environment you want to connect</p>

              <div className="space-y-3">
                {uniqueEnvironments.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleAccountSelect(account)}
                    className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                      selectedAccount?.id === account.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${account.systemColor} flex items-center justify-center`}>
                          <account.systemIcon size={24} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-base">{account.name}</div>
                          <div className="text-sm text-slate-500 mt-0.5 font-mono truncate max-w-[280px]">{account.systemUrl}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        {account.environment}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="text-xs text-slate-500 mb-2">Systems available:</div>
                      <div className="flex flex-wrap gap-2">
                        {account.systems.map((system) => (
                          <span key={system.id} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded flex items-center space-x-1">
                            <span>{system.icon}</span>
                            <span>{system.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedAccount}
                className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && selectedAccount && (
            <div>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${selectedAccount.systemColor} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <selectedAccount.systemIcon size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedAccount.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedAccount.environment} Environment</p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Sign In</span>
                  <ChevronRight size={18} />
                </button>
              </form>
            </div>
          )}

          {step === 3 && selectedAccount && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Grant Access</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Allow SAP Lobby to access your applications and provide unified workspace experience
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Systems to be connected:</h4>
                <div className="space-y-2">
                  {selectedAccount.systems.map((system) => (
                    <div key={system.id} className="flex items-center space-x-3 text-sm text-slate-700">
                      <span className="text-lg">{system.icon}</span>
                      <div className="flex-1">
                        <span className="font-medium">{system.name}</span>
                        <div className="text-xs text-slate-500 font-mono">{system.url}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-slate-600">
                    All systems will be added to <span className="font-semibold">{selectedAccount.environment}</span> environment.
                    You can enable or disable specific systems in the Connections panel.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Lock size={18} className="text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-600">
                    <p className="font-medium mb-1">Your data is protected</p>
                    <p>SAP Lobby follows enterprise security standards and only accesses data you explicitly authorize.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGrantAccessAndConnect}
                disabled={isConnecting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </span>
                ) : (
                  'Grant Access & Add Systems'
                )}
              </button>

              <button
                onClick={onClose}
                disabled={isConnecting}
                className="w-full mt-2 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
