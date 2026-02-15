import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings, useVoting } from "@/hooks/useVoting";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { ChevronRight, Clock } from "lucide-react";

const MESS_OPTIONS = ["A", "C", "D"];
const YEAR_OPTIONS = ["First Year", "Second Year", "Third Year", "Fourth Year", "Fifth Year", "Faculty"];

export default function Home() {
  const { user } = useAuth();
  

  const { settings, loading: settingsLoading } = useSettings();
  const { status, mess, year, setMess, setYear, loading: voteLoading } = useVoting(
    user?.id,
    settings?.current_month ?? ""
  );
  const navigate = useNavigate();
  const [selectedMess, setSelectedMess] = useState(mess);
  const [selectedYear, setSelectedYear] = useState(year);
  const [agreed, setAgreed] = useState(false);
  // Sync loaded values
  if (mess && !selectedMess) setSelectedMess(mess);
  if (year && !selectedYear) setSelectedYear(year);

  if (settingsLoading || voteLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!settings?.voting_open) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center animate-fade-in">
          <Clock className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            Voting is Currently Closed
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Please return during the voting period. You'll be notified when voting opens.
          </p>
        </div>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center animate-fade-in">
          <div className="glass-card p-8 max-w-md space-y-4">
  
            <h2 className="text-2xl font-display font-bold text-primary">
              Already Voted ✓
            </h2>
  
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your vote for{" "}
              <span className="text-foreground font-medium">
                {settings.current_month}
              </span>{" "}
              has been recorded successfully.
              <br />
              Thank you for participating.
            </p>
  
            <div className="pt-4 border-t border-border/30 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Developed By</p>
              <p className="text-sm font-display font-semibold text-primary">
                Ranadip Chakraborty
              </p>
              <p className="text-xs text-muted-foreground">Mess Convener</p>
            </div>
  
          </div>
        </div>
      </div>
    );
  }
  

  const canProceed = selectedMess && selectedYear && agreed;


  return (

    
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-md mx-auto p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-display font-bold text-foreground">
            {settings.current_month}
          </h2>
          <p className="text-sm text-muted-foreground">Choose your mess and year to begin voting</p>
        </div>
    
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Mess</label>
            <div className="flex gap-2">
              {MESS_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMess(m)}
                  className={`flex-1 py-2.5 rounded-lg font-display font-medium text-sm transition-all ${
                    selectedMess === m
                      ? "bg-primary text-primary-foreground neon-glow"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Mess {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Year</label>
            <div className="grid grid-cols-2 gap-2">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`py-2 px-3 rounded-lg font-display text-sm transition-all ${
                    selectedYear === y
                      ? "bg-accent text-accent-foreground accent-glow"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {y}
                </button>
                
              ))}
            </div>
          </div>
        </div>

        {status === "draft" && (
          <div className="glass-card p-3 text-center">
            <p className="text-xs text-primary font-medium">
              📝 You have a saved draft. It will be loaded automatically.
            </p>
          </div>
        )}
        <div className="glass-card p-4 space-y-3 text-sm leading-relaxed">
  <p className="text-muted-foreground">
    While choosing the menu options, please keep in mind the <b>nutritional
    value and health aspects of the meals</b>.
  </p>

  <p className="text-muted-foreground">
    The <b>Mess Committee</b> is the final authority regarding all decisions
    related to the mess menu. Its decisions are final and binding.
  </p>

  <div className="flex items-center gap-2 pt-2">
    <input
      type="checkbox"
      checked={agreed}
      onChange={(e) => setAgreed(e.target.checked)}
      className="w-4 h-4 accent-primary"
    />
    <label className="text-foreground font-medium cursor-pointer">
      I have read and agree to the above terms.
    </label>
  </div>
</div>

        <button
          onClick={() => {
            setMess(selectedMess);
            setYear(selectedYear);
            navigate("/voting", { state: { mess: selectedMess, year: selectedYear } });
          }}
          disabled={!canProceed}
          className={`w-full py-3 rounded-lg font-display font-semibold flex items-center justify-center gap-2 transition-all ${
            canProceed
              ? "bg-primary text-primary-foreground neon-glow hover:scale-[1.02] active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {status === "draft" ? "Resume Draft" : "Vote Now"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
