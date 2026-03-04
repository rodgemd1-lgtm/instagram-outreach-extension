import React, { useEffect, useState } from 'react';
import { db } from '../../database/db';
import { MSG } from '../../shared/message-types';
import type { ReceivedMessage, SentMessage, Campaign } from '../../shared/types';

interface ConversationPreview {
  username: string;
  lastMessage: string;
  lastTimestamp: number;
  unread: boolean;
  campaignName?: string;
}

export function UnifiedInbox() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [thread, setThread] = useState<{ type: 'sent' | 'received'; text: string; time: number }[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filterCampaign, setFilterCampaign] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadConversations();
    db.campaigns.toArray().then(setCampaigns);
  }, []);

  useEffect(() => {
    if (selectedUsername) loadThread(selectedUsername);
  }, [selectedUsername]);

  const loadConversations = async () => {
    const received = await db.receivedMessages.orderBy('receivedAt').reverse().toArray();
    const seen = new Set<string>();
    const convos: ConversationPreview[] = [];

    for (const msg of received) {
      if (seen.has(msg.username)) continue;
      seen.add(msg.username);

      let campaignName: string | undefined;
      if (msg.campaignId) {
        const campaign = await db.campaigns.get(msg.campaignId);
        campaignName = campaign?.name;
      }

      convos.push({
        username: msg.username,
        lastMessage: msg.messageText,
        lastTimestamp: msg.receivedAt,
        unread: !msg.read,
        campaignName,
      });
    }

    setConversations(
      filterCampaign
        ? convos.filter((c) => c.campaignName === filterCampaign)
        : convos
    );
  };

  const loadThread = async (username: string) => {
    const sent = await db.sentMessages.where('username').equals(username).sortBy('sentAt');
    const received = await db.receivedMessages.where('leadId').equals('').toArray();
    // Match by username since leadId may not be set
    const receivedForUser = (
      await db.receivedMessages.toArray()
    ).filter((m) => m.username === username);

    // Mark as read
    for (const msg of receivedForUser) {
      if (!msg.read) await db.receivedMessages.update(msg.id, { read: true });
    }

    const combined = [
      ...sent.map((m) => ({ type: 'sent' as const, text: m.messageText, time: m.sentAt })),
      ...receivedForUser.map((m) => ({ type: 'received' as const, text: m.messageText, time: m.receivedAt })),
    ].sort((a, b) => a.time - b.time);

    setThread(combined);
    loadConversations(); // Refresh unread counts
  };

  const sendReply = () => {
    if (!selectedUsername || !replyText.trim()) return;
    chrome.runtime.sendMessage({
      type: MSG.SEND_REPLY,
      payload: { username: selectedUsername, message: replyText },
    });
    setReplyText('');
    // Optimistically add to thread
    setThread([...thread, { type: 'sent', text: replyText, time: Date.now() }]);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Inbox</h2>

      <div className="flex gap-4 h-[calc(100vh-160px)]">
        {/* Conversation List */}
        <div className="w-80 bg-white rounded-lg border overflow-hidden flex flex-col">
          <div className="p-3 border-b">
            <select
              value={filterCampaign}
              onChange={(e) => { setFilterCampaign(e.target.value); setTimeout(loadConversations, 0); }}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-auto">
            {conversations.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.username}
                  onClick={() => setSelectedUsername(conv.username)}
                  className={`p-3 border-b cursor-pointer transition-colors ${
                    selectedUsername === conv.username ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } ${conv.unread ? 'bg-blue-25' : ''}`}
                >
                  <div className="flex justify-between">
                    <span className={`text-sm ${conv.unread ? 'font-bold' : 'font-medium'}`}>
                      @{conv.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(conv.lastTimestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{conv.lastMessage}</p>
                  {conv.campaignName && (
                    <span className="text-xs text-blue-500">{conv.campaignName}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thread View */}
        <div className="flex-1 bg-white rounded-lg border flex flex-col">
          {selectedUsername ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">@{selectedUsername}</h3>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {thread.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        msg.type === 'sent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.type === 'sent' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  placeholder="Type a reply..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
