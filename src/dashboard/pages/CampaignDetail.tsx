import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../database/db';
import { MSG } from '../../shared/message-types';
import { getCampaignStats } from '../../database/repositories/campaign-repository';
import type { Campaign, CampaignLead } from '../../shared/types';

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<CampaignLead[]>([]);

  useEffect(() => {
    if (!id) return;
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    if (!id) return;
    const c = await db.campaigns.get(id);
    if (c) {
      const stats = await getCampaignStats(id);
      setCampaign({ ...c, stats });
    }
    const cls = await db.campaignLeads.where('campaignId').equals(id).toArray();
    setLeads(cls);
  };

  const handleAction = async (action: string) => {
    if (!id) return;
    chrome.runtime.sendMessage({ type: action, payload: { campaignId: id } });
    setTimeout(loadCampaign, 500);
  };

  if (!campaign) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const statusCounts = {
    queued: leads.filter((l) => l.status === 'queued').length,
    in_progress: leads.filter((l) => l.status === 'in_progress').length,
    waiting_delay: leads.filter((l) => l.status === 'waiting_delay').length,
    completed: leads.filter((l) => l.status === 'completed').length,
    replied: leads.filter((l) => l.status === 'replied').length,
    failed: leads.filter((l) => l.status === 'failed').length,
    skipped: leads.filter((l) => l.status === 'skipped').length,
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {campaign.steps.length} steps &middot; Created {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'draft' && (
            <button onClick={() => handleAction(MSG.START_CAMPAIGN)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Launch
            </button>
          )}
          {campaign.status === 'active' && (
            <button onClick={() => handleAction(MSG.PAUSE_CAMPAIGN)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              Pause
            </button>
          )}
          {campaign.status === 'paused' && (
            <button onClick={() => handleAction(MSG.RESUME_CAMPAIGN)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Resume
            </button>
          )}
          <Link to={`/campaigns/${id}/edit`} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
            Edit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Leads" value={campaign.stats.totalLeads} />
        <StatCard label="Sent" value={campaign.stats.sent} />
        <StatCard label="Replied" value={campaign.stats.replied} />
        <StatCard label="Response Rate" value={`${(campaign.stats.responseRate * 100).toFixed(1)}%`} />
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="font-semibold mb-3">Lead Status Breakdown</h3>
        <div className="flex gap-4 flex-wrap text-sm">
          <span className="text-gray-500">Queued: {statusCounts.queued}</span>
          <span className="text-blue-600">In Progress: {statusCounts.in_progress}</span>
          <span className="text-yellow-600">Waiting: {statusCounts.waiting_delay}</span>
          <span className="text-green-600">Completed: {statusCounts.completed}</span>
          <span className="text-purple-600">Replied: {statusCounts.replied}</span>
          <span className="text-red-600">Failed: {statusCounts.failed}</span>
        </div>
      </div>

      {/* Lead List */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Leads ({leads.length})</h3>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Username</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Step</th>
                <th className="pb-2">Last Sent</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 100).map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium">@{lead.username}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-2 pr-4">{lead.currentStepIndex + 1}/{campaign.steps.length}</td>
                  <td className="py-2 text-gray-500">
                    {lead.lastStepSentAt ? new Date(lead.lastStepSentAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length > 100 && <p className="text-sm text-gray-400 mt-2">Showing 100 of {leads.length}</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg border p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    queued: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    waiting_delay: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    replied: 'bg-purple-100 text-purple-700',
    failed: 'bg-red-100 text-red-700',
    skipped: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${colors[status] ?? 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
