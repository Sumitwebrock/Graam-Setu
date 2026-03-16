import { useCallback, useEffect, useMemo, useState } from "react";
import BachatBoxDashboard from "../components/BachatBoxDashboard";
import ChitFundChecker from "../components/ChitFundChecker";
import CreateGoalForm from "../components/CreateGoalForm";
import EmergencyGoalSuggestion from "../components/EmergencyGoalSuggestion";
import NearbySavingsCenters from "../components/NearbySavingsCenters";
import SafeSavingsOptions from "../components/SafeSavingsOptions";
import SavingsStreak from "../components/SavingsStreak";
import SmartSavingsAdvisor from "../components/SmartSavingsAdvisor";
import SpendingReflectionPrompt from "../components/SpendingReflectionPrompt";
import SuggestedGoals from "../components/SuggestedGoals";
import WeeklyReminderToggle from "../components/WeeklyReminderToggle";
import { PiggyBank, Target } from "lucide-react";
import {
  addSavingAmount,
  createSavingsGoal,
  fetchReminderPreference,
  fetchSavingsGoals,
  fetchSavingsProgress,
  fetchUserProfileForSavings,
  getCurrentUserId,
  updateReminderPreference,
} from "../services/bachatApi";
import { useLanguage } from "../LanguageContext";

export default function BachatBoxPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalSubmitting, setGoalSubmitting] = useState(false);
  const [savingGoalId, setSavingGoalId] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [weeklyReminderEnabled, setWeeklyReminderEnabled] = useState(false);
  const [updatingReminder, setUpdatingReminder] = useState(false);
  const [saveEvents, setSaveEvents] = useState(() => {
    const raw = localStorage.getItem("bachatSaveEvents");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [latestSavingsAmount, setLatestSavingsAmount] = useState(0);
  const [latestGoalWeeklyTarget, setLatestGoalWeeklyTarget] = useState(0);
  const { language } = useLanguage();

  const userId = useMemo(() => getCurrentUserId(), []);
  const totalSaved = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.savedAmount ?? goal.currentAmount ?? 0), 0),
    [goals]
  );
  const avgProgress = useMemo(() => {
    if (!goals.length) return 0;
    const total = goals.reduce((sum, goal) => sum + Number(goal.progressPercentage || 0), 0);
    return Math.round(total / goals.length);
  }, [goals]);

  const loadGoals = useCallback(async () => {
    if (!userId) {
      setError("User not found. Please login again.");
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await fetchSavingsGoals(userId);
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load savings goals.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    const loadMeta = async () => {
      if (!userId) return;
      try {
        const [profileData, reminderData] = await Promise.all([
          fetchUserProfileForSavings(userId).catch(() => null),
          fetchReminderPreference().catch(() => null),
        ]);
        if (profileData) setProfile(profileData);
        if (reminderData) setWeeklyReminderEnabled(Boolean(reminderData.weeklyReminderEnabled));
      } catch {
        // Optional assistant data should not block the module.
      }
    };

    loadMeta();
  }, [userId]);

  const handleCreateGoal = async (payload) => {
    try {
      setGoalSubmitting(true);
      setError("");
      await createSavingsGoal({
        ...payload,
        targetAmount: Number(payload.targetAmount || 0),
      });
      await loadGoals();
    } catch (err) {
      setError(err.message || "Goal create nahi hua. Dobara try karo.");
    } finally {
      setGoalSubmitting(false);
    }
  };

  const handleAddSaving = async (goalId, amount) => {
    try {
      setSavingGoalId(goalId);
      setError("");
      await addSavingAmount({ goalId, amount: Number(amount || 0) });
      const latest = await fetchSavingsProgress(goalId);
      setGoals((prev) => prev.map((goal) => (goal.goalId === goalId ? { ...goal, ...latest } : goal)));
      setLatestSavingsAmount(Number(amount || 0));
      setLatestGoalWeeklyTarget(Number(latest.weeklyTarget || 0));

      const nextEvents = [...saveEvents, new Date().toISOString()].slice(-60);
      setSaveEvents(nextEvents);
      localStorage.setItem("bachatSaveEvents", JSON.stringify(nextEvents));
    } catch (err) {
      setError(err.message || "Savings update nahi hua. Dobara try karo.");
    } finally {
      setSavingGoalId("");
    }
  };

  const handleQuickCreateGoal = async (payload) => {
    await handleCreateGoal(payload);
  };

  const hasEmergencyGoal = useMemo(
    () => goals.some((goal) => String(goal.goalType || goal.goalName || "").toLowerCase().includes("emergency")),
    [goals]
  );

  const handleCreateEmergencyGoal = async () => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 6);

    await handleCreateGoal({
      goalName: "Emergency Fund",
      goalType: "Emergency Fund",
      targetAmount: 5000,
      targetDate: targetDate.toISOString().slice(0, 10),
      whatsAppReminder: weeklyReminderEnabled,
    });
  };

  const handleReminderToggle = async (enabled) => {
    try {
      setUpdatingReminder(true);
      setWeeklyReminderEnabled(enabled);
      await updateReminderPreference({ weeklyReminderEnabled: enabled, reminderDay: "Sunday" });
    } catch (err) {
      setWeeklyReminderEnabled((prev) => !prev);
      setError(err.message || "Reminder preference save nahi hua.");
    } finally {
      setUpdatingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8FAF9] to-white py-8 px-4">
        <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl p-4 text-gray-700 shadow-sm">Loading BachatBox...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAF9] to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-md">
          <div className="grid gap-4 p-6 md:grid-cols-[1.8fr_1fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-xs text-[#1B7F3A]">
                <PiggyBank className="h-4 w-4" />
                {language !== "en" ? "सूक्ष्म बचत सहायक" : "Micro Savings Assistant"}
              </div>
              <h1 className="mb-2 text-3xl md:text-5xl text-gray-900">BachatBox</h1>
              <p className="text-base md:text-lg text-gray-600">
                {language !== "en" ? "रोज़ थोड़ा बचाओ, कल मज़बूत बनाओ।" : "Save a little every day, build a stronger tomorrow."}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-gradient-to-br from-[#1B7F3A] to-[#4CAF50] p-4 text-white text-center shadow-sm">
                <p className="text-xs text-white/80">Total Saved</p>
                <p className="text-2xl font-semibold">₹{totalSaved.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFA726] p-4 text-white text-center shadow-sm">
                <p className="text-xs text-white/80">Active Goals</p>
                <p className="text-2xl font-semibold">{goals.length}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#E91E63] to-[#F06292] p-4 text-white text-center shadow-sm">
                <p className="text-xs text-white/80">Avg Progress</p>
                <p className="text-2xl font-semibold">{avgProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#1B7F3A]" />
              <h2 className="text-xl text-gray-900">
                {language !== "en" ? "सक्रिय बचत लक्ष्य" : "Active Savings Goals"}
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {language !== "en"
                ? "अपने लक्ष्यों को देखें, बचत जोड़ें और प्रगति देखें।"
                : "Track goals, add savings, and monitor progress."}
            </p>
            {goals.length === 0 ? (
              <div className="mt-4 space-y-4">
                <CreateGoalForm onCreateGoal={handleCreateGoal} isSubmitting={goalSubmitting} showWelcome buttonLabel="Create First Goal" />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <CreateGoalForm onCreateGoal={handleCreateGoal} isSubmitting={goalSubmitting} showWelcome={false} buttonLabel="Create Goal" />
                <BachatBoxDashboard goals={goals} onAddSaving={handleAddSaving} loadingGoalId={savingGoalId} />
              </div>
            )}
          </div>

          <EmergencyGoalSuggestion hasEmergencyGoal={hasEmergencyGoal} onCreateEmergencyGoal={handleCreateEmergencyGoal} />

          <div className="grid gap-6 lg:grid-cols-2">
            <SmartSavingsAdvisor profile={profile} />
            <WeeklyReminderToggle enabled={weeklyReminderEnabled} onToggle={handleReminderToggle} loading={updatingReminder} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SpendingReflectionPrompt latestGoalWeeklyTarget={latestGoalWeeklyTarget} latestSavingsAmount={latestSavingsAmount} />
            <SavingsStreak saveEvents={saveEvents} />
          </div>

          <SafeSavingsOptions />

          <div className="grid gap-6 lg:grid-cols-2">
            <ChitFundChecker />
            <NearbySavingsCenters district={profile?.district} state={profile?.state} />
          </div>

          {goals.length === 0 && <SuggestedGoals visible={goals.length === 0} onCreateQuickGoal={handleQuickCreateGoal} />}
        </div>
      </div>
    </div>
  );
}
