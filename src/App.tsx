import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import AuthCallback from "./components/AuthCallback";
import Navigation from "./components/Navigation";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AgentDashboard from "./components/AgentDashboard";
import "./lib/i18n"; 
import LawyerDashboard from "./components/LawyerDashboard";
import TranslationManagementPage from "./pages/admin/TranslationManagementPage";
import MigrationPage from "./pages/admin/MigrationPage";
import AdminDashboard from "./components/AdminDashboard.";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/agent"
              element={
                <ProtectedRoute>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/lawyer"
              element={
                <ProtectedRoute>
                  <LawyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/admin/translations"
              element={
                <ProtectedRoute>
                  <TranslationManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/migration"
              element={
                <ProtectedRoute>
                  <MigrationPage />
                </ProtectedRoute>
              }
            /> */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
