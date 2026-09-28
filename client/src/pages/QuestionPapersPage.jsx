import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, Award, BookOpen, Layers } from 'lucide-react';

export default function QuestionPapersPage({ setActiveTab, setSelectedPaperId, onOpenPaperModal }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/api/papers')
      .then((res) => res.json())
      .then((data) => {
        setPapers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading papers:', err);
        setLoading(false);
      });
  }, []);

  const handleDownloadPaper = (paper) => {
    const content = `
P. R. POTE PATIL COLLEGE OF ENGINEERING & MANAGEMENT, AMRAVATI
Department of Computer Science & Engineering
--------------------------------------------------------------------------------
SUBJECT: ${paper.subject}
SEMESTER: ${paper.semester || 'Semester III'}
ACADEMIC YEAR: ${paper.academic_year || 'N/A'}
EXAM TYPE: ${paper.exam_type || 'End Sem'}
================================================================================
Paper Questions are available in the CSE PYQ HUB application database.
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paper.subject.replace(/\s+/g, '_')}_Paper.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredPapers = selectedSemester === 'All'
    ? papers
    : papers.filter((p) => p.semester === selectedSemester);

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Question Papers Repository
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Previous year question papers for CSE Engineering students — P. R. Pote Patil College, Amravati.
          </p>
        </div>

        {/* Semester Filter Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {['All', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI'].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`btn ${selectedSemester === sem ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              {sem}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading question papers...</div>
        ) : filteredPapers.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No question papers found for this selection.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredPapers.map((paper) => (
              <div key={paper.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span className="badge badge-cyan">{paper.semester || 'Semester III'}</span>
                    <span className="badge badge-purple">{paper.exam_type || 'End Sem Exam'}</span>
                    {paper.academic_year && <span className="badge badge-amber">{paper.academic_year}</span>}
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                    {paper.subject}
                  </h3>

                  {paper.subject_code && (
                    <p style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Code: {paper.subject_code}
                    </p>
                  )}

                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={15} color="#34d399" />
                      <span><strong>{paper.question_count}</strong> Visible Questions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={15} color="#c084fc" />
                      <span>Exam Year: {paper.paper_year || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: [View Paper] [View Questions] [Download] */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={() => onOpenPaperModal(paper)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    title="View original paper document"
                  >
                    <Eye size={14} /> View Paper
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPaperId(paper.id);
                      setActiveTab('question-view');
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    title="View structured section questions"
                  >
                    <FileText size={14} /> View Questions
                  </button>

                  <button
                    onClick={() => handleDownloadPaper(paper)}
                    className="btn btn-outline btn-sm"
                    title="Download paper file"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
