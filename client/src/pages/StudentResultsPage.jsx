import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle, Clock, Calendar, BarChart2 } from 'lucide-react';

export default function StudentResultsPage() {
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/student/results', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setResults(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching student results:', err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <BarChart2 size={14} /> Official Academic Performance Record
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            My Test Results
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Review your past quiz attempts, score breakdown, and performance percentages.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading test results...</div>
        ) : results.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Award size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
            <h3 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>No Practice Results Found</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Attempt a practice test to see your results recorded here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {results.map((res) => (
              <div key={res.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${res.percentage >= 70 ? '#34d399' : '#fbbf24'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-purple">{res.subject}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '0.35rem 0 0 0' }}>
                      {res.test_title}
                    </h3>
                  </div>
                  <div style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    background: res.percentage >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: res.percentage >= 70 ? '#34d399' : '#fbbf24',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    {res.percentage}%
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span>Score: <strong style={{ color: '#f8fafc' }}>{res.score}/{res.total_marks}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} /> {new Date(res.completed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
