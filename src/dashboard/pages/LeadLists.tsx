import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { db } from '../../database/db';
import type { Lead } from '../../shared/types';

export function LeadLists() {
  const { leadLists, loadLeadLists } = useStore();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => { loadLeadLists(); }, []);

  useEffect(() => {
    if (selectedListId) {
      db.leads.where('listId').equals(selectedListId).toArray().then(setLeads);
    } else {
      setLeads([]);
    }
  }, [selectedListId]);

  const deleteList = async (listId: string) => {
    await db.leads.where('listId').equals(listId).delete();
    await db.leadLists.delete(listId);
    loadLeadLists();
    if (selectedListId === listId) {
      setSelectedListId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lead Lists</h2>
        <Link to="/leads/import" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Import Leads
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* List panel */}
        <div className="col-span-1 space-y-2">
          {leadLists.length === 0 ? (
            <p className="text-gray-500 text-sm">No lead lists yet</p>
          ) : (
            leadLists.map((list) => (
              <div
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedListId === list.id ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{list.name}</p>
                    <p className="text-xs text-gray-500">
                      {list.leadCount} leads &middot; {list.source} from {list.sourceTarget}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                    className="text-red-400 text-xs hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Lead detail panel */}
        <div className="col-span-2">
          {selectedListId ? (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Leads ({leads.length})</h3>
              <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-4">Username</th>
                      <th className="pb-2 pr-4">Full Name</th>
                      <th className="pb-2 pr-4">Source</th>
                      <th className="pb-2">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-50">
                        <td className="py-2 pr-4">
                          <a
                            href={lead.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            @{lead.username}
                          </a>
                        </td>
                        <td className="py-2 pr-4 text-gray-600">{lead.fullName ?? '-'}</td>
                        <td className="py-2 pr-4 text-gray-500">{lead.source}</td>
                        <td className="py-2 text-gray-400 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">Select a lead list to view leads</div>
          )}
        </div>
      </div>
    </div>
  );
}
