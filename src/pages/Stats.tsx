import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/useVoting";
import { DAY_LABELS, DAYS, MEAL_LABELS, MEALS } from "@/types/voting";
import { normalizeMealVote } from "@/lib/voteUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MenuStats = {
  score: number;
  ticks: number;
  crosses: number;
  neutrals: number;
};

type MealStats = {
  A: MenuStats;
  B: MenuStats;
};

const emptyMenuStats = (): MenuStats => ({
  score: 0,
  ticks: 0,
  crosses: 0,
  neutrals: 0,
});

const emptyMealStats = (): MealStats => ({
  A: emptyMenuStats(),
  B: emptyMenuStats(),
});

export default function Stats() {
  const { settings } = useSettings();
  const [data, setData] = useState<Record<string, MealStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!settings?.current_month) return;

    const fetchData = async () => {
      const { data: votes } = await supabase
        .from("votes")
        .select("votes")
        .eq("month", settings.current_month)
        .eq("status", "submitted");

      const result = DAYS.reduce<Record<string, MealStats>>((acc, day) => {
        MEALS.forEach((meal) => {
          acc[`${day}_${meal}`] = emptyMealStats();
        });
        return acc;
      }, {});

      votes?.forEach((row: { votes: Json }) => {
        Object.entries(result).forEach(([key, current]) => {
          const mealVote = normalizeMealVote(row.votes?.[key]);

          (["A", "B"] as const).forEach((menu) => {
            const value = mealVote[menu];
            current[menu].score += value;

            if (value === 1) current[menu].ticks += 1;
            else if (value === -1) current[menu].crosses += 1;
            else current[menu].neutrals += 1;
          });
        });
      });

      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [settings?.current_month]);

  if (loading) return <div className="min-h-screen"><Navbar /></div>;

  return (
    <div className="min-h-screen pb-10">
      <Navbar />
      <TooltipProvider>
        <div className="container max-w-5xl mx-auto p-6 space-y-10">
          <h2 className="text-xl font-display font-bold text-center">
            Voting Stats - {settings?.current_month}
          </h2>

          {DAYS.map((day) => (
            <div key={day} className="space-y-6">
              <h3 className="text-primary text-lg font-semibold">
                {DAY_LABELS[day]}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MEALS.map((meal) => {
                  const key = `${day}_${meal}`;
                  const mealStats = data[key] ?? emptyMealStats();
                  const maxMagnitude = Math.max(
                    1,
                    Math.abs(mealStats.A.score),
                    Math.abs(mealStats.B.score),
                  );

                  return (
                    <div key={key} className="glass-card p-4 space-y-4">
                      <p className="font-semibold text-center">
                        {MEAL_LABELS[meal]}
                      </p>

                      {(["A", "B"] as const).map((menu) => {
                        const stats = mealStats[menu];
                        const width = `${(Math.abs(stats.score) / maxMagnitude) * 100}%`;
                        const positive = stats.score >= 0;

                        return (
                          <div key={menu} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className={menu === "A" ? "text-primary font-semibold" : "text-accent font-semibold"}>
                                Menu {menu}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground"
                                  >
                                    Score impact: {stats.score > 0 ? `+${stats.score}` : stats.score}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 text-xs">
                                    <p>Ticks: {stats.ticks}</p>
                                    <p>Crosses: {stats.crosses}</p>
                                    <p>Neutral: {stats.neutrals}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                              <div
                                className={positive ? (menu === "A" ? "h-full bg-primary" : "h-full bg-accent") : "h-full bg-destructive"}
                                style={{ width }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
