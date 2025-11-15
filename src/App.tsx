import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/authentication/SignUpPage";
import LoginPage from "./components/authentication/LoginPage";
import Dashboard from "./components/dashboards/Dashboard";
import AuthCallback from "./components/authentication/AuthCallback";
import Navigation from "./components/Navigation";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import AgentDashboard from "./components/dashboards/AgentDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard.";
import AboutPage from "./pages/about/AboutPage";
import ContactPage from "./pages/contact/ContactPage";
import ServicesPage from "./pages/services/ServicesPage";
import CareersPage from "./pages/careers/CareersPage";
import NewsPage from "./pages/news/NewsPage";
import "./lib/i18n";
import NotFound from "./pages/not-found/NotFound";
import { Toaster } from "react-hot-toast";
import LawyerDashboard from "./components/dashboards/LawyerDashboard";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/news" element={<NewsPage />} />
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
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
