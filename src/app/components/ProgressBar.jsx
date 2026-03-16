export default function ProgressBar({ progress = 0 }) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress || 0)));

  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#F3E7D2]">
        <div
          className="h-full rounded-full bg-[#C1440E] transition-all duration-500"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-[#665a48]">Progress: {safeProgress}%</p>
    </div>
  );
}
