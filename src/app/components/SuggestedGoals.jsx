const DEFAULT_SUGGESTIONS = [
  { goalName: "School Fees", goalType: "School Fees", targetAmount: 12000 },
  { goalName: "Medical Emergency", goalType: "Medical Emergency", targetAmount: 5000 },
  { goalName: "Festival Expenses", goalType: "Festival Expenses", targetAmount: 8000 },
  { goalName: "House Repair", goalType: "House Repair", targetAmount: 15000 },
];

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

export default function SuggestedGoals({ visible, onCreateQuickGoal }) {
  if (!visible) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl text-gray-900">Suggested Goals</h3>
      <p className="mt-1 text-sm text-gray-600">Quick goals you can start with based on common needs.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {DEFAULT_SUGGESTIONS.map((item) => (
          <div key={item.goalName} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#F8FAF9] to-white p-4">
            <p className="text-base font-medium text-gray-900">{item.goalName}</p>
            <p className="text-sm text-gray-700">Suggested target: <span className="font-semibold">₹{item.targetAmount.toLocaleString("en-IN")}</span></p>
            <button
              onClick={() => onCreateQuickGoal({ ...item, targetDate: addMonths(new Date(), 6) })}
              className="mt-3 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Create Goal
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
