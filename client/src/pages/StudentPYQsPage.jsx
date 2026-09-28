import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, FileText, Download, Eye, Layers, Sparkles } from 'lucide-react';

export default function StudentPYQsPage({ setSelectedPaperId, navigate, onOpenPaperModal }) {
  const { token } = useAuth();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedExamType, setSelectedExamType] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/api/student/pyqs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPapers(data);
          setFilteredPapers(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching PYQs:', err);
        setLoading(false);
      });
  }, [token]);

  // Apply search & filters
  useEffect(() => {
    let result = papers;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.subject.toLowerCase().includes(q) ||
          (p.subject_code && p.subject_code.toLowerCase().includes(q)) ||
          (p.paper_year && p.paper_year.includes(q))
      );
    }

    if (selectedSubject !== 'All') {
      result = result.filter((p) => p.subject === selectedSubject);
    }

    if (selectedSemester !== 'All') {
      result = result.filter((p) => p.semester === selectedSemester);
    }

    if (selectedYear !== 'All') {
      result = result.filter((p) => p.paper_year === selectedYear || p.academic_year.includes(selectedYear));
    }

    if (selectedExamType !== 'All') {
      result = result.filter((p) => p.exam_type === selectedExamType);
    }

    setFilteredPapers(result);
  }, [searchQuery, selectedSubject, selectedSemester, selectedYear, selectedExamType, papers]);

  const uniqueSubjects = ['All', ...new Set(papers.map((p) => p.subject).filter(Boolean))];
  const uniqueSemesters = ['All', ...new Set(papers.map((p) => p.semester).filter(Boolean))];
  const uniqueYears = ['All', ...new Set(papers.map((p) => p.paper_year || p.academic_year).filter(Boolean))];
  const uniqueExams = ['All', ...new Set(papers.map((p) => p.exam_type).filter(Boolean))];

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Official CSE Question Papers Repository
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Previous Year Question Papers
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Search, filter by subject, semester, or year, and view original university examination papers.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Search PYQs</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Subject name, code, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Subject</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Semester</label>
              <select
                className="form-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {uniqueSemesters.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Year</label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Exam Type Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Exam / University Type</label>
              <select
                className="form-select"
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
              >
                {uniqueExams.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Question Papers List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading question papers...</div>
        ) : filteredPapers.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
            <h3 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>No Question Papers Found</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Try adjusting your search query or filter options.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredPapers.map((paper) => (
              <div key={paper.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span className="badge badge-cyan">{paper.semester || 'Sem III'}</span>
                    <span className="badge badge-purple">{paper.exam_type || 'End Sem'}</span>
                    <span className="badge badge-amber">{paper.paper_year || paper.academic_year}</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.35rem' }}>
                    {paper.subject}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    Code: {paper.subject_code || 'N/A'} • {paper.question_count || 0} Questions Total
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button
                    onClick={() => {
                      setSelectedPaperId(paper.id);
                      navigate('/student/pyqs');
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Eye size={14} /> View Questions
                  </button>

                  <button
                    onClick={() => onOpenPaperModal(paper)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Download size={14} /> Paper PDF
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
