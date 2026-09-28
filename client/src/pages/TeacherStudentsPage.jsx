import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, Mail, Phone, Award, ShieldCheck, CheckCircle } from 'lucide-react';

export default function TeacherStudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/teacher/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching students:', err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Student Activity & Academic Directory
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Registered Students & Activity
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Monitor student enrollments, practice test attempts, and quiz performance metrics.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading student records...</div>
        ) : students.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Users size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
            <h3 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>No Students Registered Yet</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Newly registered students will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {students.map((student) => (
              <div key={student.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={22} />
                    </div>
                    <span className="badge badge-cyan">{student.academicYear || 'Student'}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                    {student.fullName}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.75rem 0' }}>
                    {student.college}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} color="#64748b" /> {student.email}
                    </span>
                    {student.mobile && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color="#64748b" /> {student.mobile}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Quizzes Done</span>
                    <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{student.tests_completed}</strong>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Avg Performance</span>
                    <strong style={{ fontSize: '1rem', color: student.avg_score >= 70 ? '#34d399' : '#fbbf24' }}>
                      {Number(student.avg_score).toFixed(1)}%
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
