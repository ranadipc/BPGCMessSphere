import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { VoteMap, VoteRow, Settings } from "@/types/voting";
import { TOTAL_VOTES } from "@/types/voting";

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
          setVotes(row.votes as VoteMap);
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
      if (!userId || !month || !newMess || !newYear) return;
      setSaving(true);

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const payload = {
          user_id: userId,
          month,
          mess: newMess,
          year: newYear,
          votes: newVotes as unknown as import("@/integrations/supabase/types").Json,
          status: "draft",
        };
        await supabase.from("votes").upsert(payload, { onConflict: "user_id,month" });
        setSaving(false);
      }, 300);
    },
    [userId, month]
  );

  const setVote = useCallback(
    (key: string, choice: "A" | "B") => {
      if (status === "submitted") return;
      const updated = { ...votes, [key]: choice };
      setVotes(updated);
      if (status === "none") setStatus("draft");
      saveDraft(updated, mess, year);
    },
    [votes, status, mess, year, saveDraft]
  );

  const submitVotes = useCallback(async () => {
    if (!userId || Object.keys(votes).length < TOTAL_VOTES) return false;
    const { error } = await supabase
      .from("votes")
      .update({
        status: "submitted",
        votes: votes as unknown as import("@/integrations/supabase/types").Json,
      })
      .eq("user_id", userId)
      .eq("month", month);
    if (!error) {
      setStatus("submitted");
      return true;
    }
    return false;
  }, [userId, votes, month]);

  return {
    votes, status, mess, year, loading, saving,
    setVote, setMess, setYear, submitVotes, saveDraft,
  };
}
