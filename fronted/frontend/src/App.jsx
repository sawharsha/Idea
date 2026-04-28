import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import IdeasPage from "./pages/IdeasPage";
import SubmitIdeaPage from "./pages/SubmitIdeaPage";
import WinnersPage from "./pages/WinnersPage";
import ProfilePage from "./pages/ProfilePage";
import MyIdeasPage from "./pages/MyIdeasPage";

function PrivateRoute({ children }) {
  const { userInfo } = useAuth();
  return userInfo ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/ideas"
        element={
          <PrivateRoute>
            <IdeasPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/submit-idea"
        element={
          <PrivateRoute>
            <SubmitIdeaPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/winners"
        element={
          <PrivateRoute>
            <WinnersPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/my-ideas"
        element={
          <PrivateRoute>
            <MyIdeasPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
