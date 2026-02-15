import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useVoting";
import Navbar from "@/components/Navbar";
import { DAYS, MEALS } from "@/types/voting";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Stats() {
  const { settings } = useSettings();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!settings?.current_month) return;

    const fetchData = async () => {
      const { data: votes } = await supabase
        .from("votes")
        .select("votes")
        .eq("month", settings.current_month)
        .eq("status", "submitted");

      const result: any = {};

      DAYS.forEach((day) => {
        MEALS.forEach((meal) => {
          const key = `${day}_${meal}`;
          let countA = 0;
          let countB = 0;

          votes?.forEach((row: any) => {
            if (row.votes?.[key] === "A") countA++;
            if (row.votes?.[key] === "B") countB++;
          });

          result[key] = [
            { name: "Menu A", value: countA },
            { name: "Menu B", value: countB },
          ];
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
      <div className="container max-w-5xl mx-auto p-6 space-y-10">
        <h2 className="text-xl font-display font-bold text-center">
          Voting Stats — {settings?.current_month}
        </h2>
  
        {DAYS.map((day) => (
          <div key={day} className="space-y-6">
            <h3 className="text-primary text-lg font-semibold">
              {day === "MON" && "Monday"}
              {day === "TUE" && "Tuesday"}
              {day === "WED" && "Wednesday"}
              {day === "THU" && "Thursday"}
              {day === "FRI" && "Friday"}
              {day === "SAT" && "Saturday"}
              {day === "SUN" && "Sunday"}
            </h3>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MEALS.map((meal) => {
                const key = `${day}_${meal}`;
  
                  const baseData = data[key] || [
                    { name: "Menu A", value: 0 },
                    { name: "Menu B", value: 0 },
                  ];
                  
                  const total =
                    (baseData[0]?.value || 0) +
                    (baseData[1]?.value || 0);
                  
                  const chartData = baseData.map((item: any) => ({
                    ...item,
                  }));
                  
  
                return (
                  <div key={key} className="glass-card p-4 text-center">
                    <p className="font-semibold mb-3">
                      {meal === "BRE" && "Breakfast"}
                      {meal === "LUN" && "Lunch"}
                      {meal === "SNA" && "Snacks"}
                      {meal === "DIN" && "Dinner"}
                    </p>
  
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          outerRadius={60}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                            if (percent <= 0) return "";
                          
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#ffffff"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={14}
                                fontWeight="600"
                              >
                                {(percent * 100).toFixed(0)}%
                              </text>
                            );
                          }}
                          
                        >
                          {chartData?.map((entry: any, index: number) => (
                            <Cell
                              key={index}
                              fill={index === 0 ? "#00f5d4" : "#9b5de5"}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}