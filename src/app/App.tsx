import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "../features/auth/AuthPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { WidgetPreviewPage } from "../features/widget-preview/WidgetPreviewPage";
import { useToken } from "../hooks/useToken";
import "../styles/index.css";

export function App() {
  const { token, setToken } = useToken();

  return (
    <Routes>
      <Route path="/widget/:publicToken" element={<WidgetPreviewPage />} />
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage onToken={setToken} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          token ? (
            <DashboardPage token={token} onLogout={() => setToken(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
