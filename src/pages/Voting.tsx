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

export default function Voting() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { mess: stateMess, year: stateYear } = (location.state as { mess?: string; year?: string }) || {};

  const {
    votes, status, loading, saving,
    setVote, submitVotes, mess, year, saveDraft,
  } = useVoting(user?.id, settings?.current_month ?? "");

  const activeMess = stateMess || mess;
  const activeYear = stateYear || year;

  const [selectedDay, setSelectedDay] = useState<Day>("MON");
  const [showModal, setShowModal] = useState(false);

  if (!activeMess || !activeYear) {
    navigate("/home");
    return null;
  }

  const completedDays = DAYS.filter((day) =>
    MEALS.every((meal) => votes[`${day}_${meal}`])
  );

  const currentDayIndex = DAYS.indexOf(selectedDay);
  const voteCount = Object.keys(votes).length;

  const handleSubmit = async () => {
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
          <div className="glass-card p-8 max-w-sm">
            <h2 className="text-xl font-display font-bold text-primary mb-2">Already Voted ✓</h2>
            <p className="text-muted-foreground text-sm">
              You have already voted for {settings?.current_month}. Thank you!
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-display"
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
          votes={votes}
          onVote={(key, choice) => {
            setVote(key, choice);
            saveDraft({ ...votes, [key]: choice }, activeMess, activeYear);
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
          onSubmit={handleSubmit}
          disabled={status === "submitted"}
        />
      </div>

      <SubmitModal open={showModal} onClose={() => { setShowModal(false); navigate("/home"); }} />
    </div>
  );
}
