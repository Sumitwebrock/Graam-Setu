export default function WeeklyReminderToggle({ enabled, onToggle, loading }) {
  return (
    <div className="rounded-[8px] border border-[#C1440E18] bg-[#FFFBF0] p-5 shadow-sm">
      <h3 className="text-xl text-[#2c2416]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>Weekly Savings Reminder</h3>
      <p className="mt-1 text-sm text-[#665a48]">Reminder: Save ₹100 this week to stay on track.</p>
      <label className="mt-4 flex items-center gap-3 text-[#665a48]">
        <input
          type="checkbox"
          checked={enabled}
          disabled={loading}
          onChange={(e) => onToggle(e.target.checked)}
        />
        Enable Weekly Reminder
      </label>
    </div>
  );
}
