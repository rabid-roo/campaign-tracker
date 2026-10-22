import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

const VOTE_VALUES = [1, -1, 0] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const promiseId = searchParams.get("promise_id");
  const voterId = searchParams.get("voter_id");
  if (!promiseId) {
    return NextResponse.json({ error: "missing promise_id" }, { status: 400 });
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("votes")
    .select("vote")
    .eq("promise_id", promiseId);
  const score = (data ?? []).reduce((a, v) => a + v.vote, 0);

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

  return NextResponse.json({ score, myVote });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { promise_id, voter_id, vote } = body ?? {};
  if (!promise_id || !voter_id || !VOTE_VALUES.includes(vote)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const supabase = createClient();

  if (vote === 0) {
    await supabase
      .from("votes")
      .delete()
      .eq("promise_id", promise_id)
      .eq("voter_id", voter_id);
  } else {
    await supabase
      .from("votes")
      .upsert({ promise_id, voter_id, vote }, { onConflict: "promise_id,voter_id" });
  }

  const { data } = await supabase
    .from("votes")
    .select("vote")
    .eq("promise_id", promise_id);
  const score = (data ?? []).reduce((a, v) => a + v.vote, 0);

  return NextResponse.json({ score, myVote: vote });
}
