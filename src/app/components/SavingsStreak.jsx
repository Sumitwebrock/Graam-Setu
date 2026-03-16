import { useMemo } from "react";

const weekKey = (date) => {
  const d = new Date(date);
  const firstJan = new Date(d.getFullYear(), 0, 1);
  const dayOffset = Math.floor((d - firstJan) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((dayOffset + firstJan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

export default function SavingsStreak({ saveEvents = [] }) {
  const streak = useMemo(() => {
    if (!saveEvents.length) return 0;
    const uniqueWeeks = Array.from(new Set(saveEvents.map((event) => weekKey(event)))).sort().reverse();
    let count = 0;
    let cursor = new Date();

    for (const wk of uniqueWeeks) {
      const expected = weekKey(cursor);
      if (wk === expected) {
        count += 1;
        cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (count === 0) {
        cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (wk === weekKey(cursor)) {
          count += 1;
          cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return count;
  }, [saveEvents]);

  const badge = streak >= 8 ? "Savings Champion" : streak >= 4 ? "Smart Saver" : "Saving Beginner";

  return (
    <div className="rounded-[8px] border border-[#C1440E18] bg-[#FFFBF0] p-5 shadow-sm">
      <h3 className="text-xl text-[#2c2416]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>Savings Streak</h3>
      <p className="mt-3 text-lg text-[#665a48]">Savings Streak: {streak} weeks</p>
      <p className="mt-2 inline-block rounded-full bg-[#FDF4E3] px-3 py-1 text-sm text-[#C1440E]">{badge}</p>
    </div>
  );
}
