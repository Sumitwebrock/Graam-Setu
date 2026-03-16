import { useMemo, useState } from "react";

export default function SpendingReflectionPrompt({ latestGoalWeeklyTarget = 0, latestSavingsAmount = 0 }) {
  const [expenseAmount, setExpenseAmount] = useState("");

  const expenseWeeks = useMemo(() => {
    const amount = Number(expenseAmount || 0);
    const weekly = Number(latestGoalWeeklyTarget || 0);
    if (!amount || !weekly) return 0;
    return Math.ceil(amount / weekly);
  }, [expenseAmount, latestGoalWeeklyTarget]);

  const savingsWeeks = useMemo(() => {
    const amount = Number(latestSavingsAmount || 0);
    const weekly = Number(latestGoalWeeklyTarget || 0);
    if (!amount || !weekly) return 0;
    return Math.ceil(amount / weekly);
  }, [latestSavingsAmount, latestGoalWeeklyTarget]);

  return (
    <div className="rounded-[8px] border border-[#C1440E18] bg-[#FFFBF0] p-5 shadow-sm">
      <h3 className="text-xl text-[#2c2416]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>Spending Reflection</h3>
      <p className="mt-1 text-sm text-[#665a48]">Large expense ya savings update ke baad soch-vichar prompt.</p>

      {savingsWeeks > 0 && (
        <p className="mt-3 rounded-[8px] bg-[#FDF4E3] px-3 py-2 text-sm text-[#C1440E]">
          You just saved ₹{Number(latestSavingsAmount).toLocaleString("en-IN")}. Yeh approx {savingsWeeks} weeks ke target ke barabar hai.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="number"
          min="0"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          className="w-full rounded-[8px] border border-[#C1440E33] bg-white px-4 py-3 md:w-64"
          placeholder="Enter expense amount"
        />
      </div>

      {expenseWeeks > 0 && (
        <p className="mt-3 rounded-[8px] bg-[#FFF3E0] px-3 py-2 text-sm text-[#C1440E]">
          You are spending ₹{Number(expenseAmount).toLocaleString("en-IN")}. This equals {expenseWeeks} weeks of your savings goal.
        </p>
      )}
    </div>
  );
}
