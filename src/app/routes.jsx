import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import ProtectedRoute from "./components/ProtectedRoute";
import AgentProtectedRoute from "./components/AgentProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AgentLoginPage from "./pages/AgentLoginPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import GraamScorePage from "./pages/GraamScorePage";
import HaqDarPage from "./pages/HaqDarPage";
import HaqDarMoreSchemesPage from "./pages/HaqDarMoreSchemesPage";
import BachatBoxPage from "./pages/BachatBoxPage";
import VidhiSahayPage from "./pages/VidhiSahayPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "agent/login", Component: AgentLoginPage },
      {
        path: "agent/dashboard",
        element: (
          <AgentProtectedRoute>
            <AgentDashboardPage />
          </AgentProtectedRoute>
        ),
      },
      { 
        path: "onboarding", 
        element: <ProtectedRoute><OnboardingPage /></ProtectedRoute>
      },
      { 
        path: "dashboard", 
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      { 
        path: "graamscore", 
        element: <ProtectedRoute><GraamScorePage /></ProtectedRoute>
      },
      { 
        path: "haqdar", 
        element: <ProtectedRoute><HaqDarPage /></ProtectedRoute>
      },
      {
        path: "haqdar/find-more",
        element: <ProtectedRoute><HaqDarMoreSchemesPage /></ProtectedRoute>
      },
      { 
        path: "bachatbox", 
        element: <ProtectedRoute><BachatBoxPage /></ProtectedRoute>
      },
      {
        path: "bachat",
        element: <ProtectedRoute><BachatBoxPage /></ProtectedRoute>
      },
      { 
        path: "vidhisahay", 
        element: <ProtectedRoute><VidhiSahayPage /></ProtectedRoute>
      },
    ],
  },
]);