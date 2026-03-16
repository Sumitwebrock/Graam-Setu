import { useMemo, useState } from "react";

const GOAL_TYPES = [
  "School Fees",
  "Medical Emergency",
  "Festival Expenses",
  "House Repair",
  "Emergency Fund",
];

function getPlan(targetAmount, targetDate) {
  const target = Number(targetAmount || 0);
  const now = new Date();
  const targetDt = new Date(targetDate);
  const weeks = Math.max(1, Math.ceil((targetDt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  const weeklySaving = target > 0 ? Math.ceil(target / weeks) : 0;
  const dailySaving = weeklySaving > 0 ? Math.ceil(weeklySaving / 7) : 0;
  return { weeks, weeklySaving, dailySaving };
}

export default function CreateGoalForm({ onCreateGoal, isSubmitting, showWelcome = true, buttonLabel = "Create First Goal" }) {
  const [form, setForm] = useState({
    goalName: "",
    targetAmount: "",
    targetDate: "",
    goalType: GOAL_TYPES[0],
    whatsAppReminder: false,
    phone: "",
  });

  const plan = useMemo(
    () => getPlan(form.targetAmount, form.targetDate),
    [form.targetAmount, form.targetDate]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.goalName || !form.targetAmount || !form.targetDate || !form.goalType) return;
    onCreateGoal(form);
  };

  return (
    <div className="rounded-[8px] border border-[#C1440E18] bg-[#FFFBF0] p-6 shadow-sm">
      {showWelcome && (
        <>
          <h2 className="text-2xl text-[#2c2416]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>Start Your First Savings Goal</h2>
          <p className="mt-2 text-[#665a48]" style={{ fontFamily: "Georgia, serif" }}>
            Even small savings can create a strong future. Set a goal and we will help you save step by step.
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          className="w-full rounded-[8px] border border-[#C1440E33] bg-white px-4 py-3"
          placeholder="Goal Name (example: School Fees)"
          value={form.goalName}
          onChange={(e) => setForm((prev) => ({ ...prev, goalName: e.target.value }))}
        />

        <input
          type="number"
          min="0"
          inputMode="numeric"
          className="w-full rounded-[8px] border border-[#C1440E33] bg-white px-4 py-3"
          placeholder="Target Amount"
          value={form.targetAmount}
          onChange={(e) => setForm((prev) => ({ ...prev, targetAmount: e.target.value }))}
        />

        <input
          type="date"
          className="w-full rounded-[8px] border border-[#C1440E33] bg-white px-4 py-3"
          value={form.targetDate}
          onChange={(e) => setForm((prev) => ({ ...prev, targetDate: e.target.value }))}
        />

        <select
          className="w-full rounded-[8px] border border-[#C1440E33] bg-white px-4 py-3"
          value={form.goalType}
          onChange={(e) => setForm((prev) => ({ ...prev, goalType: e.target.value }))}
        >
          {GOAL_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-[#665a48]">
          <input
            type="checkbox"
            checked={form.whatsAppReminder}
            onChange={(e) => setForm((prev) => ({ ...prev, whatsAppReminder: e.target.checked }))}
          />
          Enable weekly reminder (optional)
        </label>

        {form.whatsAppReminder && (
          <input
            className="w-full rounded-[8px] border border-[#C1440E33] bg-white px-4 py-3"
            placeholder="WhatsApp Number"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
        )}

        {plan.weeklySaving > 0 && (
          <div className="rounded-[8px] bg-[#FDF4E3] p-4 text-sm text-[#2c2416]">
            <p>
              To reach ₹{Number(form.targetAmount || 0).toLocaleString()} in {plan.weeks} weeks:
              Save ₹{plan.weeklySaving} per week or ₹{plan.dailySaving} per day.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[8px] bg-[#C1440E] px-4 py-3 text-white hover:bg-[#A73A0C] disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : buttonLabel}
        </button>
      </form>
    </div>
  );
}
