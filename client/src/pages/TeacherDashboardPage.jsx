import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, FileText, Layers, Users, BookOpen, Plus, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function TeacherDashboardPage({ navigate }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalPapers: 0, totalQuestions: 0, totalStudents: 0, totalSubjects: 0 });
  const [recentPapers, setRecentPapers] = useState([]);

  useEffect(() => {
    // Fetch stats
    fetch('http://localhost:5000/api/stats')
      .then((res) => res.json())
      .then((data) => setStats((prev) => ({ ...prev, ...data })))
      .catch((err) => console.error(err));

    // Fetch teacher pyqs
    fetch('http://localhost:5000/api/teacher/pyqs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentPapers(data.slice(0, 3));
          setStats((prev) => ({ ...prev, totalPapers: data.length }));
        }
      })
      .catch((err) => console.error(err));

    // Fetch students count
    fetch('http://localhost:5000/api/teacher/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStats((prev) => ({ ...prev, totalStudents: data.length }));
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
          background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShieldCheck size={16} /> Faculty & Instructor Portal
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              Faculty Dashboard • {user?.fullName}
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0 }}>
              {user?.college || 'P. R. Pote Patil College of Engineering'} • {user?.branch || 'CSE'} Department
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/teacher/upload')} className="btn btn-primary">
              <Plus size={18} /> Upload Question Paper
            </button>
            <button onClick={() => navigate('/teacher/questions')} className="btn btn-secondary">
              <Layers size={18} /> Manage Questions
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{stats.totalPapers}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Managed Papers</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{stats.totalQuestions}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Database Questions</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{stats.totalStudents}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Registered Students</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{stats.totalSubjects}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Course Subjects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#818cf8" /> Question Paper Management
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Upload new end-semester examination papers, edit paper details, and organize university question papers.
            </p>
            <button onClick={() => navigate('/teacher/pyqs')} className="btn btn-primary btn-sm">
              Manage PYQs <ArrowRight size={16} />
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#34d399" /> Student Performance Tracking
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              View registered students, track quiz performance averages, and review student practice activities.
            </p>
            <button onClick={() => navigate('/teacher/students')} className="btn btn-secondary btn-sm">
              View Students <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
