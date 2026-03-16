import { useMemo } from "react";

const parseIncomeRange = (incomeRange) => {
  if (!incomeRange) return 0;
  const numbers = String(incomeRange).match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  return Math.round((numbers[0] + numbers[1]) / 2);
};

export default function SmartSavingsAdvisor({ profile }) {
  const model = useMemo(() => {
    const monthlyIncome = parseIncomeRange(profile?.incomeRange);
    const familySize = Number(profile?.familySize || profile?.familyMembers || 4);
    const debtRatio = Number(String(profile?.debtRatio || "0").replace(/[^\d.]/g, "")) || 0;

    let saveRate = 0.12;
    if (familySize >= 6) saveRate -= 0.02;
    if (debtRatio >= 40) saveRate -= 0.03;
    if (debtRatio <= 15) saveRate += 0.02;

    const boundedRate = Math.max(0.05, Math.min(0.2, saveRate));
    const recommended = Math.max(100, Math.round(monthlyIncome * boundedRate));

    return { monthlyIncome, recommended };
  }, [profile]);

  return (
    <div className="rounded-[8px] border border-[#C1440E18] bg-[#FFFBF0] p-5 shadow-sm">
      <h3 className="text-xl text-[#2c2416]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>Smart Savings Advisor</h3>
      <div className="mt-3 grid gap-2 text-sm text-[#665a48] md:grid-cols-2">
        <p>Monthly Income: ₹{model.monthlyIncome.toLocaleString("en-IN")}</p>
        <p>Recommended Savings: ₹{model.recommended.toLocaleString("en-IN")}/month</p>
      </div>
      <p className="mt-3 rounded-[8px] bg-[#FDF4E3] px-3 py-2 text-sm text-[#C1440E]">
        Saving ₹{model.recommended.toLocaleString("en-IN")} per month can help you safely reach your financial goals.
      </p>
    </div>
  );
}
