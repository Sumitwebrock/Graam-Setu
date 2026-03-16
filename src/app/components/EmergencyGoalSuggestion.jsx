export default function EmergencyGoalSuggestion({ hasEmergencyGoal, onCreateEmergencyGoal }) {
  if (hasEmergencyGoal) return null;

  return (
    <div className="rounded-[8px] border border-[#F5A62366] bg-[#FFF8E1] p-5 shadow-sm">
      <h3 className="text-lg text-[#2c2416]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>Emergency Fund Goal</h3>
      <p className="mt-1 text-sm text-[#665a48]">Target: ₹5000</p>
      <p className="mt-2 text-sm text-[#665a48]">
        Emergency savings help protect your family during unexpected situations.
      </p>
      <button
        onClick={onCreateEmergencyGoal}
        className="mt-3 rounded-[8px] bg-[#F5A623] px-3 py-2 text-sm text-white hover:bg-[#D98F16]"
      >
        Create Emergency Goal
      </button>
    </div>
  );
}
