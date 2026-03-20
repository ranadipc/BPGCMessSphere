import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Choice, Settings, VoteMap, VoteRow, VoteValue } from "@/types/voting";
import { TOTAL_VOTES } from "@/types/voting";
import { countCompletedMeals, getMissingPositiveMeals, normalizeVoteMap, serializeVoteMap, updateMealVote } from "@/lib/voteUtils";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings({ voting_open: data.voting_open, current_month: data.current_month });
        setLoading(false);
      });
  }, []);

  return { settings, loading, refetch: () => {
    supabase.from("settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setSettings({ voting_open: data.voting_open, current_month: data.current_month });
    });
  }};
}

export function useVoting(userId: string | undefined, month: string) {
  const [votes, setVotes] = useState<VoteMap>({});
  const [status, setStatus] = useState<string>("none");
  const [mess, setMess] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load existing vote
  useEffect(() => {
    if (!userId || !month) return;
    setLoading(true);
    supabase
      .from("votes")
      .select("*")
      .eq("user_id", userId)
      .eq("month", month)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const row = data as unknown as VoteRow;
          setVotes(normalizeVoteMap(row.votes as import("@/integrations/supabase/types").Json));
          setStatus(row.status);
          setMess(row.mess);
          setYear(row.year);
        } else {
          setVotes({});
          setStatus("none");
        }
        setLoading(false);
      });
  }, [userId, month]);

  const saveDraft = useCallback(
    (newVotes: VoteMap, newMess: string, newYear: string) => {
      if (!userId || !month) return;
      setSaving(true);

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const payload = {
          user_id: userId,
          month,
          mess: mess || newMess || "Unknown",
          year: year || newYear || "Unknown",
          votes: serializeVoteMap(newVotes),
          status: "draft",
        };
        console.log("Saving draft for:", userId, month, newMess, newYear);

        const { data, error } = await supabase
  .from("votes")
  .upsert(payload, { onConflict: "user_id,month" });

if (error) {
  console.error("Draft save failed:", error);
};
        setSaving(false);
      }, 300);
    },
    [userId, month]
  );

  const setVote = useCallback(
    (key: string, choice: Choice, value: VoteValue) => {
      if (status === "submitted") return;
      const updated = updateMealVote(votes, key, choice, value);
      setVotes(updated);
      if (status === "none") setStatus("draft");
      saveDraft(updated, mess, year);
    },
    [votes, status, mess, year, saveDraft]
  );

  const submitVotes = useCallback(async () => {
    if (!userId || countCompletedMeals(votes) < TOTAL_VOTES) return false;

    if (getMissingPositiveMeals(votes).length > 0) return false;
  
    const { data, error } = await supabase
      .from("votes")
      .upsert(
        {
          user_id: userId,
          month,
          mess,
          year,
          votes: serializeVoteMap(votes),
          status: "submitted",
        },
        { onConflict: "user_id,month" }
      )
      .select();
  
    if (error) {
      console.error("Submit failed:", error);
      return false;
    }
  
    await supabase.rpc("increment_vote_count", { uid: userId });
  
    setStatus("submitted");
    return true;
  }, [userId, votes, mess, year, month]);
  
  
  
  
  
  
  

  return {
    votes, status, mess, year, loading, saving,
    setVote, setMess, setYear, submitVotes, saveDraft,
  };
}
