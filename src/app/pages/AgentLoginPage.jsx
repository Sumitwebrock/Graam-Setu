import { useState } from "react";
import { useNavigate } from "react-router";

export default function AgentLoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [assignedVillage, setAssignedVillage] = useState("");
  const [bankPartner, setBankPartner] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await fetch("/api/agent/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phone, password }),
        });
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        if (!res.ok) {
          const message = data.message || "Login failed";
          // If agent does not exist, gently guide to registration.
          if (message.toLowerCase().includes("agent not found")) {
            setMode("register");
          }
          throw new Error(message);
        }
        localStorage.setItem("gs_agent_token", data.token);
        localStorage.setItem("gs_agent_name", data.agent?.name || "");
        localStorage.setItem("gs_agent_last_login", new Date().toISOString());
        navigate("/agent/dashboard", { replace: true });
      } else {
        const res = await fetch("/api/agent/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone_number: phone,
            password,
            location,
            assigned_village: assignedVillage,
            bank_partner: bankPartner,
          }),
        });
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        if (!res.ok) {
          const message = data.message || "Registration failed";
          throw new Error(message);
        }
        localStorage.setItem("gs_agent_token", data.token);
        localStorage.setItem("gs_agent_name", data.agent?.name || "");
        localStorage.setItem("gs_agent_last_login", new Date().toISOString());
        navigate("/agent/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || (mode === "login" ? "Login failed" : "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF4E3] flex items-center justify-center px-4">
      <div className="bg-white shadow-lg max-w-md w-full p-6" style={{ borderRadius: "8px" }}>
        <h1
          className="mb-2 text-center text-2xl text-[#2c2416]"
          style={{ fontFamily: "Georgia, serif", fontWeight: "700" }}
        >
          {mode === "login" ? "BC Agent Login" : "Register BC Agent"}
        </h1>
        <p className="text-sm text-center mb-6 text-[#665a48]">
          For authorized banking correspondents assisting rural users.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-sm mb-1 text-[#665a48]">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm mb-1 text-[#665a48]">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[#665a48]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            />
          </div>
          {mode === "register" && (
            <>
              <div>
                <label className="block text-sm mb-1 text-[#665a48]">Location (optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#665a48]">Assigned village (optional)</label>
                <input
                  type="text"
                  value={assignedVillage}
                  onChange={(e) => setAssignedVillage(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#665a48]">Bank partner (optional)</label>
                <input
                  type="text"
                  value={bankPartner}
                  onChange={(e) => setBankPartner(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
                />
              </div>
            </>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C1440E] text-white py-2 text-sm hover:bg-[#8B2E0B] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderRadius: "6px" }}
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
              ? "Login as BC Agent"
              : "Register as BC Agent"}
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
            className="w-full text-xs text-[#665a48] mt-2 underline"
          >
            {mode === "login"
              ? "New BC Agent? Register here"
              : "Already have an account? Login instead"}
          </button>
        </form>
      </div>
    </div>
  );
}
