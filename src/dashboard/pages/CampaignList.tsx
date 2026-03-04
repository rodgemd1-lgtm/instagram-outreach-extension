import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import type { CampaignStatus } from '../../shared/types';

const statusColors: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  error: 'bg-red-100 text-red-700',
};

export function CampaignList() {
  const { campaigns, loadCampaigns } = useStore();

  useEffect(() => { loadCampaigns(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Campaigns</h2>
        <Link to="/campaigns/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-4">No campaigns yet</p>
          <Link to="/campaigns/new" className="text-blue-600 hover:underline">Create your first campaign</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} to={`/campaigns/${campaign.id}`} className="block bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {campaign.steps.length} step{campaign.steps.length !== 1 ? 's' : ''} &middot; Created {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                  {campaign.status}
                </span>
              </div>
              <div className="mt-3 flex gap-6 text-sm text-gray-600">
                <span>Sent: {campaign.stats.sent}</span>
                <span>Replied: {campaign.stats.replied}</span>
                <span>Rate: {(campaign.stats.responseRate * 100).toFixed(1)}%</span>
                <span>Pending: {campaign.stats.pending}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
