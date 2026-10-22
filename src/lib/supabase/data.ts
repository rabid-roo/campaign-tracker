import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/client";

export type Party = {
  id: string;
  name: string;
  slug: string;
  election: string;
  year: number;
  description: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type PromiseRow = {
  id: string;
  party_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  original_quote: string | null;
  source_url: string | null;
  source_type: string;
  current_status: string;
  status_summary: string | null;
  metric: string | null;
  metric_source: string | null;
};

export type StatusUpdate = {
  id: string;
  promise_id: string;
  status: string;
  summary: string | null;
  evidence_url: string | null;
  evidence_source: string | null;
  dated_on: string | null;
  created_at: string;
};

export const getParties = cache(async (): Promise<Party[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("parties")
    .select("id, name, slug, election, year, description")
    .order("year", { ascending: true });
  if (error) throw error;
  return data as Party[];
});

export const getPartyBySlug = cache(
  async (slug: string): Promise<Party | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("parties")
      .select("id, name, slug, election, year, description")
      .eq("slug", slug)
      .single();
    if (error) return null;
    return data as Party;
  },
);

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Category[];
});

export const getPromisesByParty = cache(
  async (partyId: string): Promise<PromiseRow[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("promises")
      .select("*")
      .eq("party_id", partyId)
      .order("title", { ascending: true });
    if (error) throw error;
    return data as PromiseRow[];
  },
);

export const getStatusCountsByParty = cache(
  async (partyId: string): Promise<Record<string, number>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("promises")
      .select("current_status")
      .eq("party_id", partyId);
    if (error) throw error;
    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.current_status] = (counts[row.current_status] ?? 0) + 1;
    }
    return counts;
  },
);

export const getAllStatusCounts = cache(
  async (): Promise<Record<string, Record<string, number>>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("promises")
      .select("party_id, current_status");
    if (error) throw error;
    const map: Record<string, Record<string, number>> = {};
    for (const row of data) {
      map[row.party_id] ??= {};
      map[row.party_id][row.current_status] =
        (map[row.party_id][row.current_status] ?? 0) + 1;
    }
    return map;
  },
);

export type PromiseDetail = {
  promise: PromiseRow;
  party: Party;
  category: Category | null;
  updates: StatusUpdate[];
};

export const getPromiseById = cache(
  async (id: string): Promise<PromiseDetail | null> => {
    const supabase = createClient();
    const { data: promise, error } = await supabase
      .from("promises")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !promise) return null;

    const { data: party } = await supabase
      .from("parties")
      .select("id, name, slug, election, year, description")
      .eq("id", promise.party_id)
      .single();

    let category: Category | null = null;
    if (promise.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name, slug, sort_order")
        .eq("id", promise.category_id)
        .single();
      category = (cat as Category) ?? null;
    }

    const { data: updates } = await supabase
      .from("status_updates")
      .select("*")
      .eq("promise_id", id)
      .order("created_at", { ascending: false });

    return {
      promise: promise as PromiseRow,
      party: party as Party,
      category,
      updates: (updates as StatusUpdate[]) ?? [],
    };
  },
);

export const getVoteScore = cache(
  async (promiseId: string): Promise<number> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("votes")
      .select("vote")
      .eq("promise_id", promiseId);
    if (error) return 0;
    return (data ?? []).reduce((sum, row) => sum + row.vote, 0);
  },
);

export type Reference = {
  id: string;
  promise_id: string;
  label: string;
  url: string | null;
  source_type: string;
  page: string | null;
  note: string | null;
  sort_order: number;
};

export const getReferences = cache(
  async (promiseId: string): Promise<Reference[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("references")
      .select("*")
      .eq("promise_id", promiseId)
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data as Reference[]) ?? [];
  },
);

export type Goal = {
  id: string;
  promise_id: string;
  label: string;
  target: string | null;
  unit: string | null;
  target_value: number | null;
  current_value: number | null;
  status: string;
  source_url: string | null;
  sort_order: number;
};

export const getGoals = cache(async (promiseId: string): Promise<Goal[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("promise_id", promiseId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data as Goal[]) ?? [];
});
