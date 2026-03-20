import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSettings, useVoting } from "@/hooks/useVoting";
import { DAYS, MEALS, type Day } from "@/types/voting";
import Navbar from "@/components/Navbar";
import DaySelector from "@/components/DaySelector";
import MenuComparison from "@/components/MenuComparison";
import VoteButton from "@/components/VoteButton";
import SubmitModal from "@/components/SubmitModal";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { countCompletedMeals, getMissingPositiveMeals } from "@/lib/voteUtils";
import type { Json } from "@/integrations/supabase/types";


export default function Voting() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { mess: stateMess, year: stateYear } = (location.state as { mess?: string; year?: string }) || {};

  const {
    votes, status, loading, saving,
    setVote, submitVotes,
    mess, year,
    setMess, setYear,
    saveDraft,
  } = useVoting(user?.id, settings?.current_month ?? "");
  

  const activeMess = stateMess || mess;
  const activeYear = stateYear || year;

  useEffect(() => {
    if (activeMess && activeYear) {
      setMess(activeMess);
      setYear(activeYear);
    }
  }, [activeMess, activeYear]);
  

  const [selectedDay, setSelectedDay] = useState<Day>("MON");
  const [menuA, setMenuA] = useState<Record<string, any> | null>(null);
  const [menuB, setMenuB] = useState<Record<string, any> | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!settings?.current_month) return;
  
    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("month", settings.current_month)
        .eq("status", "approved");
  
      if (error) {
        console.error(error);
        return;
      }
  
      const a = data?.find((m) => m.type === "A");
      const b = data?.find((m) => m.type === "B");
  
      setMenuA((a?.data as Json as Record<string, any>) || null);
      setMenuB((b?.data as Json as Record<string, any>) || null);
    };
  
    fetchMenus();
  }, [settings?.current_month]);
  

  if (!activeMess || !activeYear) {
    navigate("/home");
    return null;
  }

  const missingMeals = getMissingPositiveMeals(votes);
  const missingMealSet = new Set<string>(missingMeals);
  const completedDays = DAYS.filter((day) =>
    MEALS.every((meal) => !missingMealSet.has(`${day}_${meal}`))
  );

  const currentDayIndex = DAYS.indexOf(selectedDay);
  const voteCount = countCompletedMeals(votes);

  const handleSubmit = async () => {
    if (missingMeals.length > 0) {
      alert("Each meal must have at least one tick on Menu A or Menu B before submission.");
      return;
    }

    const ok = await submitVotes();
    if (ok) setShowModal(true);
  };

  const handleNext = () => {
    if (currentDayIndex < DAYS.length - 1) {
      setSelectedDay(DAYS[currentDayIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentDayIndex > 0) {
      setSelectedDay(DAYS[currentDayIndex - 1]);
    }
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
                {settings?.current_month}
              </span>{" "}
              has been successfully recorded.
              <br />
              Thank you for contributing to this month’s mess decision.
            </p>
  
            <div className="pt-4 border-t border-border/30 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Developed By</p>
              <p className="text-sm font-display font-semibold text-primary">
                Ranadip Chakraborty
              </p>
              <p className="text-xs text-muted-foreground">Mess Convener</p>
            </div>
  
            <button
              onClick={() => navigate("/home")}
              className="mt-4 px-6 py-2 bg-muted text-foreground rounded-lg text-sm font-display hover:opacity-90 transition-opacity"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <div className="container max-w-lg mx-auto p-4 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            Mess {activeMess} · {activeYear} · {settings?.current_month}
          </p>
          <h2 className="text-lg font-display font-bold text-foreground">
            Choose Your Preferred Menu
          </h2>
        </div>

        <div className="sticky top-[57px] z-40 bg-background/80 backdrop-blur-md py-2">
          <DaySelector
            selected={selectedDay}
            onSelect={setSelectedDay}
            completedDays={completedDays}
          />
        </div>

        <MenuComparison
  day={selectedDay}
  menuA={menuA}
  menuB={menuB}
  votes={votes}
  onVote={(key, choice, value) => {
    setVote(key, choice, value);
  }}
  disabled={status === "submitted"}
/>


        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentDayIndex === 0}
            className="flex-1 py-2.5 rounded-lg bg-muted text-muted-foreground font-display text-sm flex items-center justify-center gap-1 disabled:opacity-30 transition-all hover:bg-muted/80"
          >
            <ArrowLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentDayIndex === DAYS.length - 1}
            className="flex-1 py-2.5 rounded-lg bg-muted text-muted-foreground font-display text-sm flex items-center justify-center gap-1 disabled:opacity-30 transition-all hover:bg-muted/80"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {saving && (
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Save className="w-3 h-3" /> Saving draft...
          </p>
        )}

        <VoteButton
          voteCount={voteCount}
          missingCount={missingMeals.length}
          onSubmit={handleSubmit}
          disabled={status === "submitted"}
        />
      </div>

      <SubmitModal open={showModal} onClose={() => { setShowModal(false); navigate("/home"); }} />
    </div>
  );
}
