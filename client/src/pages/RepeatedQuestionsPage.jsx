import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import { Repeat, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function RepeatedQuestionsPage() {
  const [repeatedGroups, setRepeatedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/repeated-questions')
      .then((res) => res.json())
      .then((data) => {
        setRepeatedGroups(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching repeated questions:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Page Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Repeat size={14} /> Analytics Engine
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Repeated Questions Analysis
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Questions identified across multiple examination papers for high-priority exam preparation.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Analyzing repeated question patterns...
          </div>
        ) : repeatedGroups.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <CheckCircle2 size={40} color="#34d399" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Repeated Questions Found</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Repeated question badges are strictly calculated from actual source paper overlap. Add more papers in the Admin panel to test multi-year overlap.
            </p>
          </div>
        ) : (
          <div>
            {repeatedGroups.map((group, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.8rem' }}>
                    <Repeat size={13} /> Repeated Question ({group.occurrences.length} Exams)
                  </span>

                  <span className="badge badge-cyan" style={{ fontSize: '0.8rem' }}>
                    Topic: {group.topic}
                  </span>
                </div>

                <div style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.6 }}>
                  "{group.question_text}"
                </div>

                {/* Appearance Breakdown */}
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.8)', 
                  borderRadius: '10px', 
                  padding: '1rem 1.25rem',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Appeared in:
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                    {group.occurrences.map((occ, oIdx) => (
                      <li key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} color="#34d399" />
                        <span><strong>{occ.subject}</strong> ({occ.paper_year}) — Section {occ.section}, Q{occ.question_number}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
