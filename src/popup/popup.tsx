import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MSG } from '../shared/message-types';
import '../dashboard/styles.css';

function Popup() {
  const [status, setStatus] = useState<{ instagramTabOpen: boolean } | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: MSG.GET_STATUS }, (response) => {
      if (response) setStatus(response);
    });
  }, []);

  const openDashboard = () => {
    chrome.runtime.sendMessage({ type: MSG.OPEN_DASHBOARD });
    window.close();
  };

  return (
    <div className="w-64 p-4">
      <h1 className="text-lg font-bold mb-3">IG Outreach</h1>

      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${status?.instagramTabOpen ? 'bg-green-500' : 'bg-red-400'}`} />
          <span>{status?.instagramTabOpen ? 'Instagram tab active' : 'No Instagram tab'}</span>
        </div>
      </div>

      <button
        onClick={openDashboard}
        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
      >
        Open Dashboard
      </button>

      {!status?.instagramTabOpen && (
        <button
          onClick={() => { chrome.tabs.create({ url: 'https://www.instagram.com/direct/inbox/' }); window.close(); }}
          className="w-full mt-2 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          Open Instagram
        </button>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
