import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { getOverallStats } from '../../database/repositories/analytics-repository';

export function DashboardHome() {
  const { campaigns, leadLists, unreadCount, loadCampaigns, loadLeadLists, loadUnreadCount } = useStore();
  const [stats, setStats] = useState({ activeCampaigns: 0, totalSent: 0, totalReplied: 0, totalLeads: 0, responseRate: 0 });

  useEffect(() => {
    loadCampaigns();
    loadLeadLists();
    loadUnreadCount();
    getOverallStats().then(setStats);
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Active Campaigns" value={activeCampaigns.length} color="blue" />
        <MetricCard label="Total Sent" value={stats.totalSent} color="green" />
        <MetricCard label="Total Replies" value={stats.totalReplied} color="purple" />
        <MetricCard
          label="Response Rate"
          value={`${(stats.responseRate * 100).toFixed(1)}%`}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/campaigns/new" className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors">
              New Campaign
            </Link>
            <Link to="/leads/import" className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-center hover:bg-gray-200 transition-colors">
              Import Leads
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-3">Inbox</h3>
          <p className="text-3xl font-bold text-purple-600">{unreadCount}</p>
          <p className="text-sm text-gray-500 mb-3">unread messages</p>
          <Link to="/inbox" className="text-blue-600 text-sm hover:underline">View inbox &rarr;</Link>
        </div>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-3">Active Campaigns</h3>
          <div className="space-y-3">
            {activeCampaigns.map((campaign) => (
              <Link key={campaign.id} to={`/campaigns/${campaign.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{campaign.name}</span>
                  <span className="text-sm text-gray-500">
                    {campaign.stats.sent} sent / {campaign.stats.replied} replied
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Response rate: {(campaign.stats.responseRate * 100).toFixed(1)}%
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] ?? 'bg-gray-50'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]?.split(' ')[0] ?? 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  );
}
