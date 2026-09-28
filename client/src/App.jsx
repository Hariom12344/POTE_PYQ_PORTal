import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PaperViewerModal from './components/PaperViewerModal';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Student Pages
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentPYQsPage from './pages/StudentPYQsPage';
import StudentPracticePage from './pages/StudentPracticePage';
import StudentResultsPage from './pages/StudentResultsPage';
import StudentProfilePage from './pages/StudentProfilePage';

// Teacher Pages
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import TeacherPYQsPage from './pages/TeacherPYQsPage';
import TeacherQuestionsPage from './pages/TeacherQuestionsPage';
import TeacherSubjectsPage from './pages/TeacherSubjectsPage';
import TeacherStudentsPage from './pages/TeacherStudentsPage';
import TeacherProfilePage from './pages/TeacherProfilePage';

import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedPaperId, setSelectedPaperId] = useState(1);
  const [activeModalPaper, setActiveModalPaper] = useState(null);
  const [forbiddenAlert, setForbiddenAlert] = useState(null);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPaperModal = (paper) => {
    setActiveModalPaper(paper);
  };

  const handleClosePaperModal = () => {
    setActiveModalPaper(null);
  };

  const showForbiddenBanner = (msg) => {
    setForbiddenAlert(msg);
    setTimeout(() => setForbiddenAlert(null), 5000);
  };

  // ROUTE PROTECTION MIDDLEWARE ON RENDER
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#38bdf8' }}>
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading CSE PYQ HUB...</p>
      </div>
    );
  }

  // Check route protections
  let activeComponent = null;

  // 1. Unauthenticated users trying to access protected routes -> redirect to /login
  if (!user && (currentPath.startsWith('/student') || currentPath.startsWith('/teacher'))) {
    setTimeout(() => navigate('/login'), 0);
    return null;
  }

  // 2. Student trying to access Teacher routes -> 403 Forbidden & redirect to /student/dashboard
  if (user && user.role === 'STUDENT' && currentPath.startsWith('/teacher')) {
    setTimeout(() => {
      showForbiddenBanner('403 Forbidden: Student accounts cannot access Teacher routes or management portals.');
      navigate('/student/dashboard');
    }, 0);
    return null;
  }

  // 3. Teacher trying to access Student-only routes -> redirect to /teacher/dashboard
  if (user && user.role === 'TEACHER' && (currentPath === '/student/practice' || currentPath === '/student/results')) {
    setTimeout(() => {
      showForbiddenBanner('403 Forbidden: Student practice/results portal is restricted to Student accounts.');
      navigate('/teacher/dashboard');
    }, 0);
    return null;
  }

  // Match current path
  switch (currentPath) {
    case '/':
      activeComponent = (
        <HomePage
          navigate={navigate}
          setSelectedPaperId={setSelectedPaperId}
          onOpenPaperModal={handleOpenPaperModal}
        />
      );
      break;

    case '/login':
      activeComponent = <LoginPage navigate={navigate} />;
      break;

    case '/register':
      activeComponent = <RegisterPage navigate={navigate} />;
      break;

    case '/forgot-password':
      activeComponent = <ForgotPasswordPage navigate={navigate} />;
      break;

    case '/reset-password':
      activeComponent = <ResetPasswordPage navigate={navigate} />;
      break;

    // Student Protected Routes
    case '/student/dashboard':
      activeComponent = (
        <StudentDashboardPage navigate={navigate} onOpenPaperModal={handleOpenPaperModal} />
      );
      break;

    case '/student/pyqs':
      activeComponent = (
        <StudentPYQsPage
          setSelectedPaperId={setSelectedPaperId}
          navigate={navigate}
          onOpenPaperModal={handleOpenPaperModal}
        />
      );
      break;

    case '/student/practice':
      activeComponent = <StudentPracticePage navigate={navigate} />;
      break;

    case '/student/results':
      activeComponent = <StudentResultsPage navigate={navigate} />;
      break;

    case '/student/profile':
      activeComponent = <StudentProfilePage navigate={navigate} />;
      break;

    // Teacher Protected Routes
    case '/teacher/dashboard':
      activeComponent = <TeacherDashboardPage navigate={navigate} />;
      break;

    case '/teacher/pyqs':
      activeComponent = <TeacherPYQsPage initialUploadMode={false} navigate={navigate} />;
      break;

    case '/teacher/upload':
      activeComponent = <TeacherPYQsPage initialUploadMode={true} navigate={navigate} />;
      break;

    case '/teacher/questions':
      activeComponent = <TeacherQuestionsPage navigate={navigate} />;
      break;

    case '/teacher/subjects':
      activeComponent = <TeacherSubjectsPage navigate={navigate} />;
      break;

    case '/teacher/students':
      activeComponent = <TeacherStudentsPage navigate={navigate} />;
      break;

    case '/teacher/profile':
      activeComponent = <TeacherProfilePage navigate={navigate} />;
      break;

    default:
      // Fallback: If logged in, go to respective dashboard, else Home
      if (user?.role === 'STUDENT') {
        activeComponent = <StudentDashboardPage navigate={navigate} onOpenPaperModal={handleOpenPaperModal} />;
      } else if (user?.role === 'TEACHER') {
        activeComponent = <TeacherDashboardPage navigate={navigate} />;
      } else {
        activeComponent = (
          <HomePage
            navigate={navigate}
            setSelectedPaperId={setSelectedPaperId}
            onOpenPaperModal={handleOpenPaperModal}
          />
        );
      }
      break;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* 403 Forbidden Notification Banner */}
      {forbiddenAlert && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.95)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          textAlign: 'center',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
          position: 'sticky',
          top: '72px',
          zIndex: 99
        }}>
          <ShieldAlert size={20} />
          {forbiddenAlert}
        </div>
      )}

      <main style={{ flex: 1 }}>
        {activeComponent}
      </main>

      <Footer navigate={navigate} />

      {/* Paper Viewer Modal */}
      {activeModalPaper && (
        <PaperViewerModal paper={activeModalPaper} onClose={handleClosePaperModal} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
