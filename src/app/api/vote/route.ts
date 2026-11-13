import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const VOTE_VALUES = [1, -1, 0] as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Basic in-memory rate limit (per server instance — adequate for a beta,
// but not shared across Vercel serverless instances).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_VOTES = 30;
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(key, list);
  if (list.length >= MAX_VOTES) return true;
  list.push(now);
  return false;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const promiseId = searchParams.get("promise_id");
  const voterId = searchParams.get("voter_id");
  if (!promiseId || !UUID_RE.test(promiseId)) {
    return NextResponse.json({ error: "missing promise_id" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: score } = await supabase.rpc("get_vote_score", {
    p_id: promiseId,
  });

  let myVote = 0;
  if (voterId) {
    const { data: mine } = await supabase
      .from("votes")
      .select("vote")
      .eq("promise_id", promiseId)
      .eq("voter_id", voterId)
      .maybeSingle();
    myVote = mine?.vote ?? 0;
  }

  return NextResponse.json({ score: score ?? 0, myVote });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { promise_id, voter_id, vote } = body ?? {};
  if (
    typeof promise_id !== "string" ||
    !UUID_RE.test(promise_id) ||
    typeof voter_id !== "string" ||
    !voter_id ||
    !VOTE_VALUES.includes(vote)
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (isRateLimited(clientIp(req))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const supabase = createServiceClient();

  let writeError = null;
  if (vote === 0) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("promise_id", promise_id)
      .eq("voter_id", voter_id);
    writeError = error;
  } else {
    const { error } = await supabase
      .from("votes")
      .upsert({ promise_id, voter_id, vote }, { onConflict: "promise_id,voter_id" });
    writeError = error;
  }

  if (writeError) {
    console.error("vote write failed:", writeError.message);
    return NextResponse.json({ error: "write failed" }, { status: 500 });
  }

  const { data: score } = await supabase.rpc("get_vote_score", {
    p_id: promise_id,
  });

  return NextResponse.json({ score: score ?? 0, myVote: vote });
}
