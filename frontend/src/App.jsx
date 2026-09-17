import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthModal from './components/auth/AuthModal';
import { useTheme } from './hooks/useTheme';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LMSLayout from './components/layout/LMSLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CourseView from './pages/CourseView';
import CreateCourse from './pages/CreateCourse';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import EditCoursePage from './pages/EditCoursePage';
import TrainerDashboard from './components/dashboard/TrainerDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import MyCourses from './pages/MyCourses';
import OnlineCompiler from './pages/OnlineCompiler';
import ProfileView from './pages/ProfileView';
import EditProfile from './pages/EditProfile';
import ExamPage from './pages/ExamPage';
import GradesPage from './pages/GradesPage';
import CalendarPage from './pages/CalendarPage';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useAuthModal } from './context/AuthModalContext';

function ProfileViewWrapper() {
  const { user } = useAuth();
  return <ProfileView user={user} />;
}

// Wrapper that renders the Home page while automatically opening the auth modal
function AuthModalRouteWrapper({ view }) {
  const { openModal } = useAuthModal();

  useEffect(() => {
    openModal(view);
  }, [view, openModal]);

  return <Home />;
}

// Determines whether the current route uses the LMS App Shell or the Public Marketing layout
function MainContentRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Internal LMS routes that receive the LMSLayout shell when authenticated
  const isLMSRoute = [
    '/dashboard',
    '/my-courses',
    '/courses',
    '/online-compiler',
    '/grades',
    '/calendar',
    '/create-course',
    '/profile',
    '/profile/edit',
    '/trainer/dashboard',
    '/dashboard/trainer'
  ].some(p => location.pathname === p || location.pathname.startsWith(p + '/')) ||
  (location.pathname.startsWith('/courses/') && location.pathname.endsWith('/edit'));

  // If user is authenticated on an LMS route, render inside the LMSLayout shell
  if (isAuthenticated && isLMSRoute) {
    return (
      <LMSLayout>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route path="/courses" element={<Courses />} />
          <Route path="/online-compiler" element={<OnlineCompiler />} />
          <Route
            path="/grades"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <GradesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <ProtectedRoute requiredRole="trainer">
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/edit"
            element={
              <ProtectedRoute requiredRole="trainer">
                <EditCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/dashboard"
            element={
              <ProtectedRoute requiredRole="trainer">
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/trainer"
            element={
              <ProtectedRoute requiredRole="trainer">
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileViewWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LMSLayout>
    );
  }

  // Otherwise, standard public or distraction-free learning view layout
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthModalRouteWrapper view="login" />} />
          <Route path="/register" element={<AuthModalRouteWrapper view="register" />} />
          <Route path="/forgot-password" element={<AuthModalRouteWrapper view="forgot-password" />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/online-compiler" element={<OnlineCompiler />} />

          {/* Dedicated Course Learning & Exam Environments */}
          <Route
            path="/course/view/:id"
            element={
              <ProtectedRoute>
                <CourseView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id/exam"
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            }
          />

          {/* Payment redirects */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />

          {/* Fallback for unauthenticated access to dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <GradesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <AuthProvider>
      <Router>
        <AuthModalProvider>
          <div className={`flex flex-col min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}>
            <MainContentRoutes />
          </div>

          {/* Global Auth Modal Dialog */}
          <AuthModal />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: isDarkMode ? '#0f172a' : '#ffffff',
                color: isDarkMode ? '#f8fafc' : '#0f172a',
                padding: '14px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '500',
                border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: isDarkMode ? '#0f172a' : '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: isDarkMode ? '#0f172a' : '#ffffff',
                },
              },
            }}
          />
        </AuthModalProvider>
      </Router>
    </AuthProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;