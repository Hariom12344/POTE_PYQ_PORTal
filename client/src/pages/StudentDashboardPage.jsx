import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileText, CheckCircle, Search, Award, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export default function StudentDashboardPage({ navigate, onOpenPaperModal }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ papersCount: 0, resultsCount: 0, avgScore: 0 });
  const [recentPapers, setRecentPapers] = useState([]);
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    // Fetch papers available for students
    fetch('http://localhost:5000/api/student/pyqs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentPapers(data.slice(0, 3));
          setStats((prev) => ({ ...prev, papersCount: data.length }));
        }
      })
      .catch((err) => console.error(err));

    // Fetch student's test results
    fetch('http://localhost:5000/api/student/results', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentResults(data.slice(0, 3));
          const avg = data.length > 0 ? (data.reduce((acc, r) => acc + r.percentage, 0) / data.length).toFixed(1) : 0;
          setStats((prev) => ({ ...prev, resultsCount: data.length, avgScore: avg }));
        }
      })
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{
          padding: '2rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.12) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <UserCheck size={16} /> Student Academic Portal
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.fullName}!
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0 }}>
              {user?.college || 'P. R. Pote Patil College of Engineering'} • {user?.branch || 'CSE'} ({user?.academicYear || 'Student'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/student/pyqs')} className="btn btn-primary">
              <FileText size={18} /> Browse PYQs
            </button>
            <button onClick={() => navigate('/student/practice')} className="btn btn-secondary">
              <Award size={18} /> Attempt Test
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{stats.papersCount}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Available Question Papers</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{stats.resultsCount}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Tests Attempted</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{stats.avgScore}%</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Average Quiz Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: Featured Papers & Recent Results */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Section 1: Question Papers */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="#38bdf8" /> Recent Question Papers
              </h2>
              <button onClick={() => navigate('/student/pyqs')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View All <ArrowRight size={16} />
              </button>
            </div>

            {recentPapers.map((paper) => (
              <div key={paper.id} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>{paper.semester || 'Semester III'}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0.2rem 0' }}>{paper.subject}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>{paper.exam_type || 'End Sem'} • {paper.academic_year}</p>
                  </div>
                  <button
                    onClick={() => onOpenPaperModal(paper)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    View Paper
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Recent Test Activity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#34d399" /> Recent Test Performance
              </h2>
              <button onClick={() => navigate('/student/results')} style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                All Results <ArrowRight size={16} />
              </button>
            </div>

            {recentResults.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>No tests attempted yet.</p>
                <button onClick={() => navigate('/student/practice')} className="btn btn-primary btn-sm">
                  Take a Practice Quiz
                </button>
              </div>
            ) : (
              recentResults.map((res) => (
                <div key={res.id} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>{res.test_title}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{res.subject} • {new Date(res.completed_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: res.percentage >= 70 ? '#34d399' : '#fbbf24' }}>
                        {res.percentage}%
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{res.score}/{res.total_marks} Marks</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
