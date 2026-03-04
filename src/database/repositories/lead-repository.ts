import { db } from '../db';
import type { Lead, LeadList } from '../models';
import { generateId, extractFirstName } from '../../shared/utils';

export async function createLeadList(
  name: string,
  source: Lead['source'],
  sourceTarget: string,
  description = ''
): Promise<LeadList> {
  const list: LeadList = {
    id: generateId(),
    name,
    description,
    source,
    sourceTarget,
    leadCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.leadLists.put(list);
  return list;
}

export async function addLeads(
  listId: string,
  partialLeads: Partial<Lead>[]
): Promise<number> {
  const now = Date.now();
  const existingUsernames = new Set(
    (await db.leads.where('listId').equals(listId).toArray()).map((l) => l.username)
  );

  const newLeads: Lead[] = [];
  for (const p of partialLeads) {
    if (!p.username || existingUsernames.has(p.username)) continue;
    existingUsernames.add(p.username);

    newLeads.push({
      id: generateId(),
      username: p.username,
      fullName: p.fullName ?? null,
      firstName: extractFirstName(p.fullName ?? null),
      profileUrl: p.profileUrl ?? `https://www.instagram.com/${p.username}/`,
      bio: p.bio ?? null,
      followerCount: p.followerCount ?? null,
      followingCount: p.followingCount ?? null,
      externalUrl: p.externalUrl ?? null,
      avatarUrl: p.avatarUrl ?? null,
      source: p.source ?? 'manual',
      sourceTarget: p.sourceTarget ?? '',
      customFields: p.customFields ?? {},
      tags: p.tags ?? [],
      listId,
      createdAt: now,
      updatedAt: now,
      enriched: false,
    });
  }

  if (newLeads.length > 0) {
    await db.leads.bulkPut(newLeads);
    await db.leadLists.update(listId, {
      leadCount: (await db.leads.where('listId').equals(listId).count()),
      updatedAt: now,
    });
  }

  return newLeads.length;
}

export async function getLeadsByList(listId: string): Promise<Lead[]> {
  return db.leads.where('listId').equals(listId).toArray();
}

export async function getAllLeadLists(): Promise<LeadList[]> {
  return db.leadLists.orderBy('createdAt').reverse().toArray();
}

export async function getLeadList(listId: string): Promise<LeadList | undefined> {
  return db.leadLists.get(listId);
}

export async function deleteLeadList(listId: string): Promise<void> {
  await db.leads.where('listId').equals(listId).delete();
  await db.leadLists.delete(listId);
}

export async function getLeadByUsername(username: string): Promise<Lead | undefined> {
  return db.leads.where('username').equals(username).first();
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<void> {
  await db.leads.update(id, { ...updates, updatedAt: Date.now() });
}
