import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardHome } from './pages/DashboardHome';
import { CampaignList } from './pages/CampaignList';
import { CampaignBuilder } from './pages/CampaignBuilder';
import { CampaignDetail } from './pages/CampaignDetail';
import { LeadLists } from './pages/LeadLists';
import { LeadImport } from './pages/LeadImport';
import { UnifiedInbox } from './pages/UnifiedInbox';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/new" element={<CampaignBuilder />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/campaigns/:id/edit" element={<CampaignBuilder />} />
            <Route path="/leads" element={<LeadLists />} />
            <Route path="/leads/import" element={<LeadImport />} />
            <Route path="/inbox" element={<UnifiedInbox />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
