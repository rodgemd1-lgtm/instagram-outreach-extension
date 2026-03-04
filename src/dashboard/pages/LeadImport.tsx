import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MSG } from '../../shared/message-types';
import { createLeadList, addLeads } from '../../database/repositories/lead-repository';
import { useStore } from '../store';
import type { ScrapeSource, Lead } from '../../shared/types';

export function LeadImport() {
  const navigate = useNavigate();
  const { scrapeStatus } = useStore();

  const [mode, setMode] = useState<'scrape' | 'csv'>('scrape');
  const [source, setSource] = useState<ScrapeSource>('followers');
  const [target, setTarget] = useState('');
  const [maxLeads, setMaxLeads] = useState(500);
  const [listName, setListName] = useState('');
  const [csvText, setCsvText] = useState('');

  const startScrape = async () => {
    if (!target.trim()) return;
    const name = listName || `${source} of @${target}`;

    const list = await createLeadList(name, source, target);

    chrome.runtime.sendMessage({
      type: MSG.START_SCRAPE,
      payload: {
        source,
        target: target.replace('@', ''),
        maxLeads,
        listName: name,
      },
    });

    // Navigate to leads page to watch progress
    navigate('/leads');
  };

  const importCsv = async () => {
    if (!csvText.trim()) return;
    const name = listName || 'CSV Import';

    const lines = csvText.trim().split('\n');
    const leads: Partial<Lead>[] = [];

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts[0]) {
        leads.push({
          username: parts[0].replace('@', ''),
          fullName: parts[1] || null,
          source: 'csv_import',
          sourceTarget: 'csv',
        });
      }
    }

    if (leads.length === 0) return;

    const list = await createLeadList(name, 'csv_import', 'csv');
    await addLeads(list.id, leads);
    navigate('/leads');
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Import Leads</h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('scrape')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === 'scrape' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Scrape from Instagram
        </button>
        <button
          onClick={() => setMode('csv')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === 'csv' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Import CSV
        </button>
      </div>

      {mode === 'scrape' ? (
        <div className="bg-white rounded-lg border p-6">
          {/* Scrape Status */}
          {scrapeStatus && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Scraping {scrapeStatus.source} from @{scrapeStatus.target}...
                <span className="font-bold ml-2">{scrapeStatus.scraped} leads</span>
              </p>
              <button
                onClick={() => chrome.runtime.sendMessage({ type: MSG.STOP_SCRAPE })}
                className="text-xs text-red-600 mt-1 hover:underline"
              >
                Stop scraping
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as ScrapeSource)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="followers">Followers</option>
                <option value="following">Following</option>
                <option value="likers">Post Likers</option>
                <option value="commenters">Post Commenters</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {source === 'likers' || source === 'commenters' ? 'Post URL' : 'Target Username'}
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={
                  source === 'likers' || source === 'commenters'
                    ? 'https://www.instagram.com/p/...'
                    : 'username'
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Leads</label>
              <input
                type="number"
                min={10}
                max={10000}
                value={maxLeads}
                onChange={(e) => setMaxLeads(parseInt(e.target.value) || 500)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">List Name (optional)</label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={`${source} of @${target || 'username'}`}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <button
              onClick={startScrape}
              disabled={!target.trim() || !!scrapeStatus}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Start Scraping
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="My lead list"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV Data (username, full name - one per line)
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={"johndoe, John Doe\njanesmith, Jane Smith\nalex123"}
                rows={10}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <button
              onClick={importCsv}
              disabled={!csvText.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
