import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './hooks/useTheme';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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

function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <AuthProvider>
      <Router>
        {/* Main container with proper dark mode styling */}
        <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode
            ? 'bg-slate-950 text-white'
            : 'bg-white text-gray-900'
          }`}>
          <Navbar />

          {/* Main content area */}
          <main className={`flex-grow transition-colors duration-300 ${isDarkMode
              ? 'bg-slate-950'
              : 'bg-white'
            }`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/online-compiler" element={<OnlineCompiler />} />  
              

              {/* Protected Routes */}
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
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/course/view/:id"
                element={
                  <ProtectedRoute>
                    <CourseView />
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
                path="/my-courses"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />

              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>

        {/* Toast notifications with dark mode support */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: isDarkMode ? '#1e293b' : '#ffffff',
              color: isDarkMode ? '#f1f5f9' : '#1f2937',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb',
            },
            success: {
              duration: 3000,
              style: {
                background: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f1f5f9' : '#1f2937',
                border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb',
              },
              iconTheme: {
                primary: '#10B981',
                secondary: isDarkMode ? '#1e293b' : '#ffffff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f1f5f9' : '#1f2937',
                border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: isDarkMode ? '#1e293b' : '#ffffff',
              },
            },
          }}
        />
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