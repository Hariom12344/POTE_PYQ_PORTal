import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer({ navigate }) {
  const { user } = useAuth();

  return (
    <footer style={{
      marginTop: '4rem',
      backgroundColor: '#060911',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '3rem 0 2rem 0',
      color: '#94a3b8'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Institution Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a'
              }}>
                <GraduationCap size={20} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                CSE PYQ HUB
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Dedicated previous year question paper platform for Computer Science Engineering students and faculty of <strong>P. R. Pote Patil College of Engineering & Management, Amravati</strong>.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                  Home Overview
                </button>
              </li>
              {user?.role === 'STUDENT' && (
                <>
                  <li>
                    <button onClick={() => navigate('/student/dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Student Dashboard
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/student/pyqs')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Browse Question Papers
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/student/practice')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Practice Tests
                    </button>
                  </li>
                </>
              )}
              {user?.role === 'TEACHER' && (
                <>
                  <li>
                    <button onClick={() => navigate('/teacher/dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Faculty Dashboard
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/teacher/pyqs')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Manage Question Papers
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/teacher/students')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Student Directory
                    </button>
                  </li>
                </>
              )}
              {!user && (
                <>
                  <li>
                    <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Sign In
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                      Create Account
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Department Info */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              Academic Department
            </h4>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Department of Computer Science & Engineering
            </p>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              P. R. Pote Patil Educational Campus, Kathora Road, Amravati, Maharashtra 444602.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.825rem'
        }}>
          <p>© 2026 CSE PYQ HUB — P. R. Pote Patil College of Engineering & Management, Amravati.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built for CSE Students & Faculty with role-based security.
          </p>
        </div>
      </div>
    </footer>
  );
}
