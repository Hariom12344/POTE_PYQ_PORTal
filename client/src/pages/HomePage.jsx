import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileText, Search, Layers, Download, CheckCircle, Sparkles, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function HomePage({ navigate, setSelectedPaperId, onOpenPaperModal }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPapers: 0, totalSubjects: 0, totalQuestions: 0, totalTopics: 0 });
  const [featuredPaper, setFeaturedPaper] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err));

    fetch('http://localhost:5000/api/papers')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setFeaturedPaper(data[0]);
        }
      })
      .catch((err) => console.error('Failed to fetch papers:', err));
  }, []);

  const handleExplore = () => {
    if (user?.role === 'STUDENT') navigate('/student/pyqs');
    else if (user?.role === 'TEACHER') navigate('/teacher/pyqs');
    else navigate('/login');
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '4rem 0 3rem 0',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#38bdf8',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> Official Academic Repository • Amravati
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#f8fafc',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            CSE PYQ HUB
          </h1>

          <p style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: '#38bdf8',
            marginBottom: '0.5rem'
          }}>
            P. R. Pote Patil College of Engineering & Management, Amravati
          </p>

          <p style={{
            fontSize: '1.05rem',
            color: '#94a3b8',
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Centralized previous year question papers platform with secure role-based access for Computer Science Engineering Students and Teachers.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExplore}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
            >
              Explore PYQs <ArrowRight size={18} />
            </button>

            {!user ? (
              <button
                onClick={() => navigate('/login')}
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
              >
                <LogIn size={18} /> Sign In
              </button>
            ) : (
              <button
                onClick={() => navigate(user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard')}
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
              >
                My Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Counter Cards */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {stats.totalPapers}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>
                Total Papers
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {stats.totalSubjects}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>
                Total Subjects
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <CheckCircle size={24} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {stats.totalQuestions}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>
                Total Questions
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {stats.totalTopics}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>
                Total Topics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Paper Section */}
      {featuredPaper && (
        <section style={{ padding: '2.5rem 0' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#38bdf8" /> Featured Academic Question Paper
            </h2>

            <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-cyan">{featuredPaper.semester || 'Semester III'}</span>
                    <span className="badge badge-purple">{featuredPaper.exam_type || 'End Sem Exam'}</span>
                    <span className="badge badge-emerald">Authentic Source</span>
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
                    {featuredPaper.subject}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    P. R. Pote Patil College of Engineering & Management • Computer Science & Engineering
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onOpenPaperModal(featuredPaper)}
                    className="btn btn-secondary"
                  >
                    <FileText size={16} /> View Original Paper
                  </button>

                  <button
                    onClick={() => {
                      if (!user) navigate('/login');
                      else if (user.role === 'STUDENT') navigate('/student/pyqs');
                      else navigate('/teacher/pyqs');
                    }}
                    className="btn btn-primary"
                  >
                    View Questions ({featuredPaper.question_count})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
