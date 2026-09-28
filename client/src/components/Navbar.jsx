import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Award,
  BarChart2,
  User,
  LogOut,
  Upload,
  Layers,
  BookOpen,
  Users,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar({ currentPath, navigate }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isCurrent = (path) => currentPath === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo & College Identity */}
        <div 
          onClick={() => {
            if (user?.role === 'STUDENT') navigate('/student/dashboard');
            else if (user?.role === 'TEACHER') navigate('/teacher/dashboard');
            else navigate('/');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
                CSE PYQ HUB
              </span>
              {user && (
                <span className={`badge ${user.role === 'TEACHER' ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
              P. R. Pote Patil College of Engineering
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Links based on Role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* STUDENT NAVBAR LINKS */}
          {user?.role === 'STUDENT' && (
            <>
              <button
                onClick={() => navigate('/student/dashboard')}
                className={`btn ${isCurrent('/student/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>

              <button
                onClick={() => navigate('/student/pyqs')}
                className={`btn ${isCurrent('/student/pyqs') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <FileText size={16} /> PYQs
              </button>

              <button
                onClick={() => navigate('/student/practice')}
                className={`btn ${isCurrent('/student/practice') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <Award size={16} /> Practice
              </button>

              <button
                onClick={() => navigate('/student/results')}
                className={`btn ${isCurrent('/student/results') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <BarChart2 size={16} /> Results
              </button>

              <button
                onClick={() => navigate('/student/profile')}
                className={`btn ${isCurrent('/student/profile') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <User size={16} /> Profile
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}

          {/* TEACHER NAVBAR LINKS */}
          {user?.role === 'TEACHER' && (
            <>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className={`btn ${isCurrent('/teacher/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>

              <button
                onClick={() => navigate('/teacher/pyqs')}
                className={`btn ${isCurrent('/teacher/pyqs') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <FileText size={16} /> PYQs
              </button>

              <button
                onClick={() => navigate('/teacher/upload')}
                className={`btn ${isCurrent('/teacher/upload') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <Upload size={16} /> Upload PYQ
              </button>

              <button
                onClick={() => navigate('/teacher/questions')}
                className={`btn ${isCurrent('/teacher/questions') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <Layers size={16} /> Questions
              </button>

              <button
                onClick={() => navigate('/teacher/subjects')}
                className={`btn ${isCurrent('/teacher/subjects') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <BookOpen size={16} /> Subjects
              </button>

              <button
                onClick={() => navigate('/teacher/students')}
                className={`btn ${isCurrent('/teacher/students') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <Users size={16} /> Students
              </button>

              <button
                onClick={() => navigate('/teacher/profile')}
                className={`btn ${isCurrent('/teacher/profile') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <User size={16} /> Profile
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}

          {/* PUBLIC / UNAUTHENTICATED NAVBAR LINKS */}
          {!user && (
            <>
              <button
                onClick={() => navigate('/')}
                className={`btn ${isCurrent('/') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                Home
              </button>

              <button
                onClick={() => navigate('/login')}
                className={`btn ${isCurrent('/login') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <LogIn size={16} /> Login
              </button>

              <button
                onClick={() => navigate('/register')}
                className={`btn ${isCurrent('/register') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <UserPlus size={16} /> Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
