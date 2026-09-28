import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Layers, Plus, ShieldCheck, CheckCircle } from 'lucide-react';

export default function TeacherSubjectsPage() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/teacher/subjects', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSubjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Course Curriculum Management
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Subjects & Exam Categories
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Overview of department subjects, codes, and available exam question paper coverage.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading subjects...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {subjects.map((sub, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #818cf8' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <BookOpen size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                  {sub.subject}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
                  Subject Code: {sub.subject_code || 'N/A'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Repository Papers:</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.8rem' }}>{sub.paper_count} Papers</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
