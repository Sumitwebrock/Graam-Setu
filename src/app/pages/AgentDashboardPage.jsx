import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Bell,
  LogOut,
  Settings,
  Users,
  FileText,
  PiggyBank,
  ShieldAlert,
  Scale,
  Search,
} from "lucide-react";
import AgentSidebar from "../components/AgentSidebar";

function StatCard({ label, value, accent, onViewDetails }) {
  return (
    <div className="bg-white border border-[#E2D4BF] rounded-xl p-4 flex flex-col justify-between shadow-sm">
      <div className="text-xs uppercase tracking-wide text-[#8b7960] mb-1">{label}</div>
      <div className="text-2xl font-semibold text-[#2c2416] mb-3">{value}</div>
      <button
        type="button"
        onClick={onViewDetails}
        className="self-start text-xs font-medium text-[#C1440E] hover:text-[#8B2E0B] flex items-center gap-1"
      >
        <span>View details</span>
        <span className="text-[10px]">→</span>
      </button>
      {accent && <div className="mt-3 h-1 rounded-full" style={{ background: accent }} />}
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 bg-white border border-[#E2D4BF] rounded-xl p-3.5 text-left hover:border-[#C1440E] hover:shadow-sm transition"
    >
      <div className="mt-0.5 bg-[#FDF4E3] rounded-full p-2 text-[#C1440E]">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#2c2416] mb-0.5">{label}</div>
        <div className="text-[11px] text-[#7a6a51]">{description}</div>
      </div>
    </button>
  );
}

export default function AgentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("gs_agent_token") : null;
  const agentName = typeof window !== "undefined" ? localStorage.getItem("gs_agent_name") || "Agent" : "Agent";
  const lastLoginIso = typeof window !== "undefined" ? localStorage.getItem("gs_agent_last_login") : null;

  const lastLoginDisplay = useMemo(() => {
    if (!lastLoginIso) return "Today";
    const d = new Date(lastLoginIso);
    if (Number.isNaN(d.getTime())) return "Today";
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }, [lastLoginIso]);

  useEffect(() => {
    if (!token) {
      navigate("/agent/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/agent/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load agent dashboard");
        }
        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load agent dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadPending = async () => {
      setPendingLoading(true);
      setPendingError("");
      try {
        const res = await fetch("/api/agent/pending-verifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load pending verifications");
        }
        if (!cancelled) {
          setPendingVerifications(Array.isArray(data.users) ? data.users : []);
        }
      } catch (err) {
        if (!cancelled) {
          setPendingError(err.message || "Failed to load pending verifications");
        }
      } finally {
        if (!cancelled) {
          setPendingLoading(false);
        }
      }
    };

    loadPending();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = dashboard?.stats || {
    totalUsersAssisted: 0,
    schemesApplied: 0,
    savingsAssists: 0,
    fraudReportsSubmitted: 0,
  };

  const handleLogout = () => {
    localStorage.removeItem("gs_agent_token");
    localStorage.removeItem("gs_agent_name");
    localStorage.removeItem("gs_agent_last_login");
    navigate("/agent/login", { replace: true });
  };

  // Simple helpers for quick navigation that reuse existing citizen modules
  const goToRegister = () => navigate("/register");
  const goToHaqdar = () => navigate("/haqdar");
  const goToBachat = () => navigate("/bachatbox");
  const goToFraud = () => navigate("/vidhisahay");
  const goToLegal = () => navigate("/vidhisahay");

  // Scroll to section when arriving with a hash (e.g. /agent/dashboard#agent-schemes)
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const handleVerifyUser = async (userId) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/agent/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to verify user");
      }
      setPendingVerifications((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setPendingError(err.message || "Failed to verify user");
    }
  };

  const handleRejectUser = async (userId) => {
    if (!userId) return;
    const reason = window.prompt("Enter rejection reason (optional):") || undefined;
    try {
      const res = await fetch("/api/agent/reject-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to reject user");
      }
      setPendingVerifications((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setPendingError(err.message || "Failed to reject user");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF4E3] flex">
      <AgentSidebar />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#E2D4BF] px-4 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <div className="text-xs uppercase tracking-wide text-[#8b7960] mb-1">BC Agent Dashboard</div>
            <div className="text-xl md:text-2xl font-semibold text-[#2c2416]">Welcome, {agentName}</div>
            <div className="text-xs md:text-sm text-[#7a6a51] mt-1">
              {dashboard?.agent?.assigned_village && (
                <span className="mr-3">Village: {dashboard.agent.assigned_village}</span>
              )}
              {dashboard?.agent?.bank_partner && (
                <span className="mr-3">Bank partner: {dashboard.agent.bank_partner}</span>
              )}
              <span>Last login: {lastLoginDisplay}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2 rounded-full hover:bg-[#FDF4E3] text-[#7a6a51]" type="button">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#FDF4E3] text-[#7a6a51]" type="button">
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs md:text-sm bg-[#C1440E] text-white px-3 py-1.5 rounded-full hover:bg-[#8B2E0B]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Overview statistics */}
          <section aria-label="Overview statistics" className="grid md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard
              label="Total users assisted"
              value={stats.totalUsersAssisted}
              accent="linear-gradient(90deg,#C1440E,#F5A623)"
              onViewDetails={() => {
                const el = document.getElementById("agent-activity");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <StatCard
              label="Schemes applied"
              value={stats.schemesApplied}
              accent="#F5A623"
              onViewDetails={() => {
                const el = document.getElementById("agent-schemes");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <StatCard
              label="Active savings assists"
              value={stats.savingsAssists}
              accent="#2196F3"
              onViewDetails={() => {
                const el = document.getElementById("agent-savings");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <StatCard
              label="Fraud reports filed"
              value={stats.fraudReportsSubmitted}
              accent="#C1440E"
              onViewDetails={() => {
                const el = document.getElementById("agent-fraud");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <StatCard
              label="Legal assistance requests"
              value={0}
              accent="#7B3F00"
              onViewDetails={() => {
                const el = document.getElementById("agent-legal");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </section>

          {/* Quick actions + profile sidebar */}
          <section className="grid lg:grid-cols-[2fr,1fr] gap-6 items-start">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#2c2416] mb-3">Quick actions</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <QuickActionButton
                  icon={Users}
                  label="Register new user"
                  description="Create a GraamSetu profile for a villager"
                  onClick={goToRegister}
                />
                <QuickActionButton
                  icon={FileText}
                  label="Check scheme eligibility"
                  description="Open Haqdar to see eligible schemes"
                  onClick={goToHaqdar}
                />
                <QuickActionButton
                  icon={PiggyBank}
                  label="Add savings contribution"
                  description="Update a user's BachatBox goal"
                  onClick={goToBachat}
                />
                <QuickActionButton
                  icon={ShieldAlert}
                  label="Report fraud case"
                  description="Capture a scam or suspicious activity"
                  onClick={goToFraud}
                />
                <QuickActionButton
                  icon={Scale}
                  label="Submit legal help request"
                  description="Open VidhiSahayak flows for this user"
                  onClick={goToLegal}
                />
              </div>
            </div>

            {/* Agent profile sidebar */}
            <aside className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-2" aria-label="Agent profile">
              <div className="text-xs uppercase tracking-wide text-[#8b7960]">Agent profile</div>
              <div className="text-lg font-semibold text-[#2c2416]">{dashboard?.agent?.name || agentName}</div>
              <div className="text-xs text-[#7a6a51]">
                {dashboard?.agent?.assigned_village && <div>Assigned village: {dashboard.agent.assigned_village}</div>}
                {dashboard?.agent?.bank_partner && <div>Bank partner: {dashboard.agent.bank_partner}</div>}
                <div>Total users assisted: {stats.totalUsersAssisted}</div>
                {dashboard?.agent?.created_at && <div>Join date: {new Date(dashboard.agent.created_at).toLocaleDateString("en-IN")}</div>}
              </div>
            </aside>
          </section>

          {/* Pending verifications for BC agents */}
          <section
            id="agent-verification"
            aria-label="Pending user verifications"
            className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#2c2416]">Pending verifications</h2>
                <p className="text-[11px] text-[#7a6a51]">
                  Review user profiles and documents before approving or rejecting.
                </p>
              </div>
              {pendingLoading && (
                <span className="text-[11px] text-[#7a6a51]">Loading…</span>
              )}
            </div>
            {pendingError && (
              <div className="text-[11px] text-red-700">{pendingError}</div>
            )}
            <div className="overflow-x-auto border border-[#E2D4BF] rounded-lg text-xs">
              <table className="min-w-full bg-white">
                <thead className="bg-[#FDF4E3] text-[#7a6a51]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Phone</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Risk</th>
                    <th className="px-3 py-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVerifications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-[#7a6a51]">
                        {pendingLoading
                          ? "Loading pending verifications..."
                          : "No pending verifications right now."}
                      </td>
                    </tr>
                  ) : (
                    pendingVerifications.map((user) => (
                      <tr key={user.id} className="border-t border-[#F0E4D2]">
                        <td className="px-3 py-2">{user.name || "—"}</td>
                        <td className="px-3 py-2">{user.phone || "—"}</td>
                        <td className="px-3 py-2">{user.verificationStatus || "PENDING_AGENT_REVIEW"}</td>
                        <td className="px-3 py-2">
                          {user.riskFlag ? (
                            <span className="text-red-700">High</span>
                          ) : (
                            <span className="text-[#7a6a51]">Normal</span>
                          )}
                        </td>
                        <td className="px-3 py-2 space-x-2">
                          <button
                            type="button"
                            className="text-[11px] text-[#1B7F3A] hover:text-[#155d2b]"
                            onClick={() => handleVerifyUser(user.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="text-[11px] text-[#C1440E] hover:text-[#8B2E0B]"
                            onClick={() => handleRejectUser(user.id)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* User search panel */}
          <section id="users" aria-label="User search" className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base md:text-lg font-semibold text-[#2c2416]">Search villagers</h2>
              <span className="text-[11px] text-[#7a6a51]">Search by phone, name or village</span>
            </div>
            <UserSearchTable token={token} />
          </section>

          {/* Scheme assistance */}
          <section
            id="agent-schemes"
            aria-label="Scheme assistance"
            className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#2c2416]">Scheme assistance</h2>
                <p className="text-[11px] text-[#7a6a51]">Recent Haqdar support for villagers</p>
              </div>
              <button
                type="button"
                onClick={goToHaqdar}
                className="text-xs text-[#C1440E] hover:text-[#8B2E0B]"
              >
                Open Haqdar
              </button>
            </div>
            <p className="text-[11px] text-[#7a6a51]">
              Detailed scheme assistance history will appear here as agents use the Haqdar and agent tools in production.
            </p>
          </section>

          {/* Savings panel */}
          <section
            id="agent-savings"
            aria-label="BachatBox savings"
            className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#2c2416]">BachatBox savings</h2>
                <p className="text-[11px] text-[#7a6a51]">Track village savings goals and contributions</p>
              </div>
              <button
                type="button"
                onClick={goToBachat}
                className="text-xs text-[#C1440E] hover:text-[#8B2E0B]"
              >
                Open BachatBox
              </button>
            </div>
            <p className="text-[11px] text-[#7a6a51]">
              This panel will surface savings goals and progress per user once data is connected via the agent APIs.
            </p>
          </section>

          {/* Fraud alerts panel */}
          <section
            id="agent-fraud"
            aria-label="Fraud alerts"
            className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#2c2416]">Fraud alerts</h2>
                <p className="text-[11px] text-[#7a6a51]">Recent fraud complaints from your village</p>
              </div>
              <button
                type="button"
                onClick={goToFraud}
                className="text-xs text-[#C1440E] hover:text-[#8B2E0B]"
              >
                Report new fraud
              </button>
            </div>
            <p className="text-[11px] text-[#7a6a51]">
              As agents submit fraud reports, a log of fraud types, districts and statuses will be shown here.
            </p>
          </section>

          {/* Legal assistance panel */}
          <section
            id="agent-legal"
            aria-label="Legal assistance"
            className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#2c2416]">Legal assistance</h2>
                <p className="text-[11px] text-[#7a6a51]">VidhiSahayak help for villagers</p>
              </div>
              <button
                type="button"
                onClick={goToLegal}
                className="text-xs text-[#C1440E] hover:text-[#8B2E0B]"
              >
                Submit legal request
              </button>
            </div>
            <p className="text-[11px] text-[#7a6a51]">
              Legal help requests filed through VidhiSahayak will show here once wired to the agent activity feed.
            </p>
          </section>

          {/* Village analytics + Activity log placeholder */}
          <section
            aria-label="Village analytics and activity log"
            className="grid lg:grid-cols-2 gap-6 items-start"
          >
            <div className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3" id="agent-village">
              <h2 className="text-base md:text-lg font-semibold text-[#2c2416] mb-1">Village analytics</h2>
              <p className="text-[11px] text-[#7a6a51] mb-2">
                High-level snapshot for the assigned village. This will later pull from the same datasets that power
                Haqdar, BachatBox and Fraud reporting.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FDF4E3] border border-[#E2D4BF] rounded-lg p-3">
                  <div className="text-[10px] text-[#8b7960] mb-1">Total registered users</div>
                  <div className="text-lg font-semibold text-[#2c2416]">{stats.totalUsersAssisted}</div>
                </div>
                <div className="bg-[#FDF4E3] border border-[#E2D4BF] rounded-lg p-3">
                  <div className="text-[10px] text-[#8b7960] mb-1">Schemes applied</div>
                  <div className="text-lg font-semibold text-[#2c2416]">{stats.schemesApplied}</div>
                </div>
                <div className="bg-[#FDF4E3] border border-[#E2D4BF] rounded-lg p-3">
                  <div className="text-[10px] text-[#8b7960] mb-1">Savings assists</div>
                  <div className="text-lg font-semibold text-[#2c2416]">{stats.savingsAssists}</div>
                </div>
                <div className="bg-[#FDF4E3] border border-[#E2D4BF] rounded-lg p-3">
                  <div className="text-[10px] text-[#8b7960] mb-1">Fraud reports</div>
                  <div className="text-lg font-semibold text-[#2c2416]">{stats.fraudReportsSubmitted}</div>
                </div>
              </div>
            </div>

            <div
              id="agent-activity"
              className="bg-white border border-[#E2D4BF] rounded-xl p-4 space-y-3"
              aria-label="Activity log"
            >
              <h2 className="text-base md:text-lg font-semibold text-[#2c2416] mb-1">Recent activity</h2>
              <p className="text-[11px] text-[#7a6a51] mb-2">
                As agents use the assistance tools, a chronological log of actions (scheme checks, savings updates,
                fraud reports) will appear here.
              </p>
              <ul className="space-y-2 text-xs text-[#2c2416]">
                <li>10:32 AM – Checked scheme eligibility for Ram Lal</li>
                <li>11:15 AM – Added \\u20b9500 savings for Sunita Devi</li>
                <li>01:05 PM – Reported UPI fraud for local kirana shop</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function UserSearchTable({ token }) {
  const [query, setQuery] = useState({ phone: "", name: "", village: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setQuery((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setError("");
    if (!token) {
      setError("Agent session expired. Please login again.");
      return;
    }

    const payload = {
      phone: query.phone.trim() || undefined,
      name: query.name.trim() || undefined,
      village: query.village.trim() || undefined,
    };

    if (!payload.phone && !payload.name && !payload.village) {
      setError("Enter phone, name or village to search.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (payload.phone) params.set("phone", payload.phone);
      if (payload.name) params.set("name", payload.name);
      if (payload.village) params.set("village", payload.village);

      const res = await fetch(`/api/agent/users/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Search failed");
      }
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3" id="agent-users">
      <form
        onSubmit={handleSearch}
        className="grid md:grid-cols-4 gap-2 items-end bg-[#FDF4E3] border border-[#E2D4BF] rounded-lg p-3"
      >
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#7a6a51]">Phone number</label>
          <div className="relative">
            <input
              type="tel"
              value={query.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full border border-[#D4C5AA] rounded-md px-2 py-1.5 text-xs pr-7 focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
              placeholder="10-digit mobile"
            />
            <Search className="w-3.5 h-3.5 text-[#B09A7A] absolute right-2 top-1.5" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#7a6a51]">Name</label>
          <input
            type="text"
            value={query.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-[#D4C5AA] rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            placeholder="Villager name"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[#7a6a51]">Village</label>
          <input
            type="text"
            value={query.village}
            onChange={(e) => handleChange("village", e.target.value)}
            className="w-full border border-[#D4C5AA] rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            placeholder="Village name"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#C1440E] text-white text-xs font-medium rounded-md px-3 py-1.5 hover:bg-[#8B2E0B] disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && <div className="text-[11px] text-red-600">{error}</div>}

      <div className="overflow-x-auto border border-[#E2D4BF] rounded-lg text-xs" aria-label="Search results">
        <table className="min-w-full bg-white">
          <thead className="bg-[#FDF4E3] text-[#7a6a51]">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Village</th>
              <th className="px-3 py-2 text-left font-medium">Savings status</th>
              <th className="px-3 py-2 text-left font-medium">Eligible schemes</th>
              <th className="px-3 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-[#7a6a51]">
                  {loading ? "Searching villagers..." : "No users found yet. Try another search."}
                </td>
              </tr>
            ) : (
              results.map((user) => (
                <tr key={user.id} className="border-t border-[#F0E4D2]">
                  <td className="px-3 py-2">{user.name || "—"}</td>
                  <td className="px-3 py-2">{user.village || user.location || "—"}</td>
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-[11px] text-[#C1440E] hover:text-[#8B2E0B]"
                    >
                      View profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
