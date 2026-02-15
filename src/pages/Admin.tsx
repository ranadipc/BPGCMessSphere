import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useVoting";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { Settings, Download, Trash2, Users } from "lucide-react";

const ADMIN_EMAILS = ["ranadip@goa.bits-pilani.ac.in"]; // Add admin emails here

export default function Admin() {
  const { user } = useAuth();
  const { settings, loading, refetch } = useSettings();
  const navigate = useNavigate();
  const [monthInput, setMonthInput] = useState("");
  const [participationCount, setParticipationCount] = useState(0);
  const [updating, setUpdating] = useState(false);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (settings?.current_month) {
      setMonthInput(settings.current_month);
      supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("month", settings.current_month)
        .eq("status", "submitted")
        .then(({ count }) => setParticipationCount(count ?? 0));
    }
  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-destructive font-display">Access Denied</p>
        </div>
      </div>
    );
  }

  const toggleVoting = async () => {
    if (!settings) return;
    setUpdating(true);
    await supabase.from("settings").update({ voting_open: !settings.voting_open }).eq("id", 1);
    refetch();
    setUpdating(false);
  };

  const updateMonth = async () => {
    if (!monthInput.trim()) return;
    setUpdating(true);
    await supabase.from("settings").update({ current_month: monthInput.trim() }).eq("id", 1);
    refetch();
    setUpdating(false);
  };

  const exportCSV = async () => {
    if (!settings?.current_month) return;
    const { data } = await supabase
      .from("votes")
      .select("*")
      .eq("month", settings.current_month)
      .eq("status", "submitted");

    if (!data || data.length === 0) return;

    const headers = ["user_id", "mess", "year", "month", "status", "created_at", ...Object.keys((data[0].votes as Record<string, string>) || {})];
    const rows = data.map((row) => {
      const v = row.votes as Record<string, string>;
      return [row.user_id, row.mess, row.year, row.month, row.status, row.created_at, ...Object.keys(v).map((k) => v[k])].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `votes_${settings.current_month.replace(/\s/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetMonth = async () => {
    if (!settings?.current_month) return;
    if (!confirm(`Delete all votes for "${settings.current_month}"? This cannot be undone.`)) return;
    setUpdating(true);
    // Note: this requires a delete policy. For now we use edge function or direct
    // We'll handle via RPC or direct delete with service role
    // For simplicity, admins would use the Cloud View for this
    setUpdating(false);
    alert("Please use Cloud View > Run SQL to delete votes for this month.");
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-lg mx-auto p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-display font-bold text-foreground">Admin Panel</h2>
        </div>

        {/* Voting Toggle */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="font-display font-medium text-foreground text-sm">Voting Status</p>
            <p className="text-xs text-muted-foreground">
              Currently {settings?.voting_open ? "Open" : "Closed"}
            </p>
          </div>
          <button
            onClick={toggleVoting}
            disabled={updating}
            className={`px-4 py-2 rounded-lg font-display text-sm font-medium transition-all ${
              settings?.voting_open
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground neon-glow"
            }`}
          >
            {settings?.voting_open ? "Close Voting" : "Open Voting"}
          </button>
        </div>

        {/* Month */}
        <div className="glass-card p-4 space-y-3">
          <p className="font-display font-medium text-foreground text-sm">Current Month</p>
          <div className="flex gap-2">
            <input
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              placeholder="e.g., February 2026"
              className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
            />
            <button
              onClick={updateMonth}
              disabled={updating}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-display text-sm font-medium"
            >
              Set
            </button>
          </div>
        </div>

        {/* Participation */}
        <div className="glass-card p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="font-display font-medium text-foreground text-sm">Participation</p>
            <p className="text-xs text-muted-foreground">
              {participationCount} submitted votes for {settings?.current_month || "—"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-display text-sm font-medium flex items-center justify-center gap-2 neon-glow"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={resetMonth}
            className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-display text-sm font-medium flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Reset Month
          </button>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full py-2 text-muted-foreground text-sm font-display hover:text-foreground transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
