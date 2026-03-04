import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { updateSettings } from '../../database/repositories/settings-repository';
import type { AppSettings } from '../../shared/types';

export function Settings() {
  const { settings, loadSettings } = useStore();
  const [form, setForm] = useState<Partial<AppSettings>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadSettings();
  };

  if (!form.id) return <div className="text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Rate Limiting */}
        <section>
          <h3 className="font-semibold mb-3">Rate Limiting</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Global daily send limit</label>
              <input
                type="number"
                min={1}
                max={200}
                value={form.globalDailyLimit ?? 60}
                onChange={(e) => setForm({ ...form, globalDailyLimit: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-1">Varies +/-15% daily for safety</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min delay between sends (sec)</label>
              <input
                type="number"
                min={10}
                value={(form.defaultMinDelay ?? 45000) / 1000}
                onChange={(e) => setForm({ ...form, defaultMinDelay: (parseInt(e.target.value) || 45) * 1000 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max delay between sends (sec)</label>
              <input
                type="number"
                min={30}
                value={(form.defaultMaxDelay ?? 120000) / 1000}
                onChange={(e) => setForm({ ...form, defaultMaxDelay: (parseInt(e.target.value) || 120) * 1000 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Active Hours */}
        <section>
          <h3 className="font-semibold mb-3">Active Hours</h3>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start</label>
              <input
                type="number"
                min={0}
                max={23}
                value={form.defaultActiveHoursStart ?? 8}
                onChange={(e) => setForm({ ...form, defaultActiveHoursStart: parseInt(e.target.value) || 8 })}
                className="w-20 px-3 py-2 border rounded-lg"
              />
            </div>
            <span className="mt-6">to</span>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End</label>
              <input
                type="number"
                min={0}
                max={23}
                value={form.defaultActiveHoursEnd ?? 22}
                onChange={(e) => setForm({ ...form, defaultActiveHoursEnd: parseInt(e.target.value) || 22 })}
                className="w-20 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Messages will only be sent during these hours</p>
        </section>

        {/* Other Settings */}
        <section>
          <h3 className="font-semibold mb-3">Other</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.enrichLeadsOnScrape ?? false}
                onChange={(e) => setForm({ ...form, enrichLeadsOnScrape: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Auto-enrich leads on scrape (slower but gets bios, follower counts)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.notificationsEnabled ?? true}
                onChange={(e) => setForm({ ...form, notificationsEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Enable browser notifications</span>
            </label>
          </div>
        </section>

        {/* Today's Stats */}
        <section className="pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Messages sent today: <strong>{form.todaySendCount ?? 0}</strong></span>
            <span>Daily limit: <strong>{form.globalDailyLimit ?? 60}</strong></span>
          </div>
        </section>

        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
