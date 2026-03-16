import { useMemo, useState } from "react";
import ProgressBar from "./ProgressBar";

const milestoneText = (progress) => {
  if (progress >= 100) return "Goal completed celebration! Bahut badhiya!";
  if (progress >= 75) return "Almost there! Bas thoda aur.";
  if (progress >= 50) return "Halfway done! Aap sahi track par ho.";
  if (progress >= 25) return "Great start! Choti jeet, badi aadat.";
  return "Shuruaat ho gayi hai. Roz thoda save karo.";
};

export default function BachatBoxDashboard({ goals, onAddSaving, loadingGoalId }) {
  const [inputs, setInputs] = useState({});

  const orderedGoals = useMemo(
    () => [...goals].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()),
    [goals]
  );

  return (
    <div className="space-y-5">
      {orderedGoals.map((goal) => {
        const saved = Number(goal.savedAmount ?? goal.currentAmount ?? 0);
        const target = Number(goal.targetAmount || 0);
        const progress = Number(goal.progressPercentage || (target > 0 ? Math.round((saved / target) * 100) : 0));
        const amountInput = inputs[goal.goalId] || "";

        return (
          <div key={goal.goalId} className="rounded-[8px] border border-[#C1440E18] bg-[#FFFBF0] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl text-[#2c2416]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>{goal.goalName}</h3>
                <p className="text-sm text-[#665a48]">{goal.goalType}</p>
              </div>
              <p className="text-sm text-[#665a48]">Target Date: {new Date(goal.targetDate).toLocaleDateString("en-IN")}</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <p className="text-[#665a48]">Target Amount: ₹{target.toLocaleString()}</p>
              <p className="text-[#665a48]">Current Saved Amount: ₹{saved.toLocaleString()}</p>
              <p className="text-[#665a48]">Weekly Savings Target: ₹{Number(goal.weeklyTarget || 0).toLocaleString()}</p>
              <p className="text-[#665a48]">Progress Percentage: {progress}%</p>
            </div>

            <div className="mt-4">
              <ProgressBar progress={progress} />
              <p className="mt-2 text-sm text-[#C1440E]">{milestoneText(progress)}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={amountInput}
                onChange={(e) => setInputs((prev) => ({ ...prev, [goal.goalId]: e.target.value }))}
                className="w-44 rounded-[8px] border border-[#C1440E33] bg-white px-3 py-2"
                placeholder="Add amount"
              />
              <button
                className="rounded-[8px] bg-[#C1440E] px-4 py-2 text-white hover:bg-[#A73A0C] disabled:opacity-60"
                disabled={loadingGoalId === goal.goalId}
                onClick={() => {
                  const amount = Number(amountInput || 0);
                  if (!amount) return;
                  onAddSaving(goal.goalId, amount);
                  setInputs((prev) => ({ ...prev, [goal.goalId]: "" }));
                }}
              >
                {loadingGoalId === goal.goalId ? "Saving..." : "Add Savings"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
