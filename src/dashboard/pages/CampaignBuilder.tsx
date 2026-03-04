import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../database/db';
import { useStore } from '../store';
import { generateId } from '../../shared/utils';
import { previewTemplate, validateTemplate } from '../../shared/template-engine';
import { MSG } from '../../shared/message-types';
import type { Campaign, CampaignStep, MessageVariant, CampaignSettings } from '../../shared/types';
import {
  DEFAULT_DAILY_LIMIT,
  DEFAULT_MIN_DELAY_MS,
  DEFAULT_MAX_DELAY_MS,
  DEFAULT_ACTIVE_HOURS_START,
  DEFAULT_ACTIVE_HOURS_END,
  MAX_CAMPAIGN_STEPS,
  MAX_VARIANTS_PER_STEP,
} from '../../shared/constants';

const defaultSettings: CampaignSettings = {
  dailyLimit: DEFAULT_DAILY_LIMIT,
  minDelayBetweenSends: DEFAULT_MIN_DELAY_MS / 1000,
  maxDelayBetweenSends: DEFAULT_MAX_DELAY_MS / 1000,
  activeHoursStart: DEFAULT_ACTIVE_HOURS_START,
  activeHoursEnd: DEFAULT_ACTIVE_HOURS_END,
  stopOnReply: true,
  skipIfAlreadyMessaged: true,
};

function createStep(order: number): CampaignStep {
  return {
    id: generateId(),
    order,
    variants: [{ id: generateId(), label: 'Variant A', text: '', weight: 1 }],
    delayAfterPrevious: order === 0 ? 0 : 24 * 60 * 60 * 1000,
    delayUnit: 'days',
  };
}

export function CampaignBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leadLists, loadLeadLists } = useStore();

  const [name, setName] = useState('');
  const [leadListId, setLeadListId] = useState('');
  const [steps, setSteps] = useState<CampaignStep[]>([createStep(0)]);
  const [settings, setSettings] = useState<CampaignSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLeadLists();
    if (id) {
      db.campaigns.get(id).then((campaign) => {
        if (campaign) {
          setName(campaign.name);
          setLeadListId(campaign.leadListId);
          setSteps(campaign.steps);
          setSettings(campaign.settings);
        }
      });
    }
  }, [id]);

  const addStep = () => {
    if (steps.length >= MAX_CAMPAIGN_STEPS) return;
    setSteps([...steps, createStep(steps.length)]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updates: Partial<CampaignStep>) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const addVariant = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.variants.length >= MAX_VARIANTS_PER_STEP) return;
    const label = `Variant ${String.fromCharCode(65 + step.variants.length)}`;
    updateStep(stepIndex, {
      variants: [...step.variants, { id: generateId(), label, text: '', weight: 1 }],
    });
  };

  const updateVariant = (stepIndex: number, variantIndex: number, updates: Partial<MessageVariant>) => {
    const step = steps[stepIndex];
    const newVariants = step.variants.map((v, i) => (i === variantIndex ? { ...v, ...updates } : v));
    updateStep(stepIndex, { variants: newVariants });
  };

  const removeVariant = (stepIndex: number, variantIndex: number) => {
    const step = steps[stepIndex];
    if (step.variants.length <= 1) return;
    updateStep(stepIndex, { variants: step.variants.filter((_, i) => i !== variantIndex) });
  };

  const save = async (launch = false) => {
    if (!name.trim() || !leadListId) return;
    setSaving(true);

    try {
      const now = Date.now();
      const campaign: Campaign = {
        id: id ?? generateId(),
        name: name.trim(),
        status: launch ? 'active' : 'draft',
        leadListId,
        steps: steps.map((s, i) => ({ ...s, order: i })),
        settings: {
          ...settings,
          minDelayBetweenSends: settings.minDelayBetweenSends * 1000,
          maxDelayBetweenSends: settings.maxDelayBetweenSends * 1000,
        },
        stats: { totalLeads: 0, sent: 0, delivered: 0, replied: 0, failed: 0, pending: 0, responseRate: 0 },
        createdAt: id ? (await db.campaigns.get(id))?.createdAt ?? now : now,
        updatedAt: now,
        startedAt: launch ? now : null,
        pausedAt: null,
        completedAt: null,
      };

      await db.campaigns.put(campaign);

      if (launch) {
        chrome.runtime.sendMessage({ type: MSG.START_CAMPAIGN, payload: { campaignId: campaign.id } });
      }

      navigate(`/campaigns/${campaign.id}`);
    } finally {
      setSaving(false);
    }
  };

  const delayToMs = (value: number, unit: string) => {
    switch (unit) {
      case 'minutes': return value * 60 * 1000;
      case 'hours': return value * 60 * 60 * 1000;
      case 'days': return value * 24 * 60 * 60 * 1000;
      default: return value;
    }
  };

  const msToValue = (ms: number, unit: string) => {
    switch (unit) {
      case 'minutes': return Math.round(ms / 60000);
      case 'hours': return Math.round(ms / 3600000);
      case 'days': return Math.round(ms / 86400000);
      default: return ms;
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Campaign' : 'New Campaign'}</h2>

      {/* Campaign Name */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My outreach campaign"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lead List */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Lead List</label>
        <select
          value={leadListId}
          onChange={(e) => setLeadListId(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a lead list...</option>
          {leadLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name} ({list.leadCount} leads)
            </option>
          ))}
        </select>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-4">
        {steps.map((step, stepIndex) => (
          <div key={step.id} className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Step {stepIndex + 1}</h3>
              {steps.length > 1 && (
                <button onClick={() => removeStep(stepIndex)} className="text-red-500 text-sm hover:underline">
                  Remove
                </button>
              )}
            </div>

            {/* Delay (not for first step) */}
            {stepIndex > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">Wait</span>
                <input
                  type="number"
                  min={1}
                  value={msToValue(step.delayAfterPrevious, step.delayUnit)}
                  onChange={(e) =>
                    updateStep(stepIndex, {
                      delayAfterPrevious: delayToMs(parseInt(e.target.value) || 1, step.delayUnit),
                    })
                  }
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
                <select
                  value={step.delayUnit}
                  onChange={(e) =>
                    updateStep(stepIndex, {
                      delayUnit: e.target.value as CampaignStep['delayUnit'],
                      delayAfterPrevious: delayToMs(
                        msToValue(step.delayAfterPrevious, step.delayUnit),
                        e.target.value
                      ),
                    })
                  }
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
                <span className="text-sm text-gray-600">after previous step</span>
              </div>
            )}

            {/* Variants */}
            <div className="space-y-3">
              {step.variants.map((variant, variantIndex) => (
                <div key={variant.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{variant.label}</span>
                    {step.variants.length > 1 && (
                      <button
                        onClick={() => removeVariant(stepIndex, variantIndex)}
                        className="text-red-400 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    value={variant.text}
                    onChange={(e) => updateVariant(stepIndex, variantIndex, { text: e.target.value })}
                    placeholder="Hey {firstName}, I saw your profile and..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Variables: {'{firstName}'}, {'{name}'}, {'{username}'}
                    </span>
                    {variant.text && (
                      <span className="text-xs text-gray-500">
                        Preview: {previewTemplate(variant.text).slice(0, 60)}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {step.variants.length < MAX_VARIANTS_PER_STEP && (
              <button
                onClick={() => addVariant(stepIndex)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                + Add Variant
              </button>
            )}
          </div>
        ))}
      </div>

      {steps.length < MAX_CAMPAIGN_STEPS && (
        <button onClick={addStep} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors mb-4">
          + Add Step
        </button>
      )}

      {/* Campaign Settings */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="font-semibold mb-3">Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Daily send limit</label>
            <input
              type="number"
              min={1}
              max={200}
              value={settings.dailyLimit}
              onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Active hours</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={23}
                value={settings.activeHoursStart}
                onChange={(e) => setSettings({ ...settings, activeHoursStart: parseInt(e.target.value) || 8 })}
                className="w-16 px-2 py-2 border rounded text-sm"
              />
              <span className="text-sm">to</span>
              <input
                type="number"
                min={0}
                max={23}
                value={settings.activeHoursEnd}
                onChange={(e) => setSettings({ ...settings, activeHoursEnd: parseInt(e.target.value) || 22 })}
                className="w-16 px-2 py-2 border rounded text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.stopOnReply}
              onChange={(e) => setSettings({ ...settings, stopOnReply: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Stop sequence on reply</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.skipIfAlreadyMessaged}
              onChange={(e) => setSettings({ ...settings, skipIfAlreadyMessaged: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Skip if already messaged</label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => save(false)}
          disabled={saving || !name.trim() || !leadListId}
          className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || !name.trim() || !leadListId}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Launch Campaign'}
        </button>
      </div>
    </div>
  );
}
