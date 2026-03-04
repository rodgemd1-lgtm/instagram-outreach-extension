import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { getOverallStats, getDailyStats, getCampaignAnalytics, type CampaignAnalytics } from '../../database/repositories/analytics-repository';
import { db } from '../../database/db';

export function Analytics() {
  const [overall, setOverall] = useState({ activeCampaigns: 0, totalSent: 0, totalReplied: 0, totalLeads: 0, responseRate: 0 });
  const [dailyStats, setDailyStats] = useState<{ date: string; sent: number; replied: number }[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignAnalytics[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [stats, daily, campaigns] = await Promise.all([
      getOverallStats(),
      getDailyStats(30),
      db.campaigns.toArray(),
    ]);

    setOverall(stats);
    setDailyStats(daily);

    const analytics: CampaignAnalytics[] = [];
    for (const campaign of campaigns) {
      const a = await getCampaignAnalytics(campaign.id);
      if (a) analytics.push(a);
    }
    setCampaignStats(analytics);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card label="Total Sent" value={overall.totalSent} />
        <Card label="Total Replied" value={overall.totalReplied} />
        <Card label="Response Rate" value={`${(overall.responseRate * 100).toFixed(1)}%`} />
        <Card label="Total Leads" value={overall.totalLeads} />
      </div>

      {/* Daily Activity Chart */}
      {dailyStats.length > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="font-semibold mb-4">Daily Activity (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Sent" strokeWidth={2} />
              <Line type="monotone" dataKey="replied" stroke="#8b5cf6" name="Replied" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Campaign Comparison */}
      {campaignStats.length > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="font-semibold mb-4">Campaign Performance</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Campaign</th>
                <th className="pb-2 pr-4">Sent</th>
                <th className="pb-2 pr-4">Replied</th>
                <th className="pb-2">Response Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaignStats.map((cs) => (
                <tr key={cs.campaignId} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium">{cs.campaignName}</td>
                  <td className="py-2 pr-4">{cs.totalSent}</td>
                  <td className="py-2 pr-4">{cs.totalReplied}</td>
                  <td className="py-2">{(cs.responseRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* A/B Variant Performance */}
      {campaignStats.some((cs) => cs.variantPerformance.length > 1) && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-4">A/B Variant Performance</h3>
          {campaignStats
            .filter((cs) => cs.variantPerformance.length > 1)
            .map((cs) => (
              <div key={cs.campaignId} className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{cs.campaignName}</p>
                <div className="space-y-1">
                  {cs.variantPerformance.map((vp) => (
                    <div key={vp.variantId} className="flex items-center gap-3 text-sm">
                      <span className="w-24 text-gray-600">{vp.variantLabel}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.max(vp.responseRate * 100, 2)}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-gray-500">
                        {(vp.responseRate * 100).toFixed(1)}% ({vp.timesReplied}/{vp.timesSent})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
