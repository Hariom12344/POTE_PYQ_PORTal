import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import { ArrowLeft, Eye } from 'lucide-react';

export default function QuestionViewPage({ paperId, setActiveTab, onOpenPaperModal }) {
  const [paperData, setPaperData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idToFetch = paperId || 1; // Default to paper 1 (C Programming paper) if none selected
    fetch(`http://localhost:5000/api/papers/${idToFetch}`)
      .then((res) => res.json())
      .then((data) => {
        setPaperData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching paper details:', err);
        setLoading(false);
      });
  }, [paperId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>
        Loading paper questions...
      </div>
    );
  }

  if (!paperData) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>
        Paper not found.
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Back Navigation */}
        <button
          onClick={() => setActiveTab('papers')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Question Papers
        </button>

        {/* Paper Header */}
        <div className="glass-card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-cyan">{paperData.semester || 'Semester III'}</span>
                <span className="badge badge-purple">{paperData.exam_type || 'End Sem Exam'}</span>
                <span className="badge badge-emerald">Authentic Source</span>
              </div>

              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.35rem' }}>
                {paperData.subject} Previous Year Questions
              </h1>

              <p style={{ fontSize: '0.925rem', color: '#94a3b8' }}>
                P. R. Pote Patil College of Engineering & Management, Amravati • Computer Science & Engineering
              </p>
            </div>

            <button
              onClick={() => onOpenPaperModal(paperData)}
              className="btn btn-primary"
            >
              <Eye size={16} /> View Original Paper
            </button>
          </div>
        </div>

        {/* Structured Sections (SECTION 3B, SECTION 4A, SECTION 4B, SECTION 5A, SECTION 5B, SECTION 6A, SECTION 6B) */}
        {paperData.sections && paperData.sections.length > 0 ? (
          paperData.sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '2.5rem' }}>
              {/* Section Title Header */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                    {section.sectionName}
                  </span>
                  {section.instruction && (
                    <span style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#fbbf24', fontWeight: 600 }}>
                      ({section.instruction})
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>
                  {section.questions.length} Questions
                </span>
              </div>

              {/* Questions in Section */}
              {section.questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No questions available for this paper.
          </div>
        )}
      </div>
    </div>
  );
}
