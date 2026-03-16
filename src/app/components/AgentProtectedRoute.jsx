import { Navigate } from "react-router";

export default function AgentProtectedRoute({ children }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("gs_agent_token") : null;

  if (!token) {
    return <Navigate to="/agent/login" replace />;
  }

  return children;
}
