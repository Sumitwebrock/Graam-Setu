import { useMemo, useState } from "react";

const MOCK_REGISTRY = {
  "TN-CHIT-10234": "Registered",
  "MH-CHIT-88421": "Registered",
  "UP-CHIT-00000": "Suspicious",
};

export default function ChitFundChecker() {
  const [regNo, setRegNo] = useState("");

  const status = useMemo(() => {
    const key = regNo.trim().toUpperCase();
    if (!key) return "";
    if (MOCK_REGISTRY[key]) return MOCK_REGISTRY[key];
    if (/[^A-Z0-9-]/.test(key) || key.length < 8) return "Suspicious";
    return "Not Registered";
  }, [regNo]);

  const statusColor = status === "Registered" ? "text-emerald-600" : status === "Suspicious" ? "text-red-600" : "text-amber-600";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl text-gray-900">Chit Fund Safety Checker</h3>
      <p className="mt-1 text-sm text-gray-600">Enter registration number to quickly check safety.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 md:w-80"
          placeholder="Enter chit fund registration number"
        />
      </div>
      {status && (
        <p className={`mt-3 text-sm font-medium ${statusColor}`}>
          Status: {status}
        </p>
      )}
    </div>
  );
}
