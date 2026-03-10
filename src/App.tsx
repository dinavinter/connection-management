import { useState } from 'react';
import AdminPage from './components/AdminPage';
import ConnectSystemFlow from './components/ConnectSystemFlow';

export default function App() {
  const [showConnectFlow, setShowConnectFlow] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminPage />
      {showConnectFlow && <ConnectSystemFlow onClose={() => setShowConnectFlow(false)} />}
    </div>
  );
}
