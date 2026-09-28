import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, FileText, Search, ShieldCheck, CheckCircle, AlertCircle, Upload } from 'lucide-react';

export default function TeacherPYQsPage({ initialUploadMode = false, navigate }) {
  const { token } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(initialUploadMode);

  const [paperForm, setPaperForm] = useState({
    id: null,
    subject: '',
    subject_code: '',
    semester: 'Semester III',
    academic_year: '2023-2024',
    exam_type: 'End Semester Examination',
    paper_year: '2023',
    pdf_url: '',
    image_url: ''
  });

  useEffect(() => {
    loadPapers();
  }, [token]);

  const loadPapers = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/teacher/pyqs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPapers(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading papers:', err);
        setLoading(false);
      });
  };

  const showBanner = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSavePaper = (e) => {
    e.preventDefault();
    if (!paperForm.subject) {
      showBanner('Please enter Subject name', true);
      return;
    }

    const isEdit = Boolean(paperForm.id);
    const url = isEdit
      ? `http://localhost:5000/api/teacher/pyqs/${paperForm.id}`
      : 'http://localhost:5000/api/teacher/pyqs';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paperForm)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save paper');
        return res.json();
      })
      .then(() => {
        showBanner(isEdit ? 'Paper updated successfully!' : 'Question paper uploaded successfully!');
        resetForm();
        setShowUploadModal(false);
        loadPapers();
      })
      .catch((err) => showBanner(err.message, true));
  };

  const handleDeletePaper = (id) => {
    if (!window.confirm('Deleting this paper will remove all associated questions. Proceed?')) return;

    fetch(`http://localhost:5000/api/teacher/pyqs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete paper');
        return res.json();
      })
      .then(() => {
        showBanner('Paper deleted successfully!');
        loadPapers();
      })
      .catch((err) => showBanner(err.message, true));
  };

  const resetForm = () => {
    setPaperForm({
      id: null,
      subject: '',
      subject_code: '',
      semester: 'Semester III',
      academic_year: '2023-2024',
      exam_type: 'End Semester Examination',
      paper_year: '2023',
      pdf_url: '',
      image_url: ''
    });
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <ShieldCheck size={14} /> Faculty Management
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Question Papers Portal
            </h1>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowUploadModal(!showUploadModal);
            }}
            className="btn btn-primary"
          >
            <Upload size={18} /> {showUploadModal ? 'Close Form' : 'Upload Question Paper'}
          </button>
        </div>

        {message && (
          <div style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            background: message.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${message.isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: message.isError ? '#f87171' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            {message.isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {message.text}
          </div>
        )}

        {/* Upload / Edit Paper Form Card */}
        {showUploadModal && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', borderLeft: '4px solid #818cf8' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="#818cf8" /> {paperForm.id ? 'Edit Question Paper' : 'Upload New Question Paper'}
            </h3>

            <form onSubmit={handleSavePaper}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Programming in C"
                    value={paperForm.subject}
                    onChange={(e) => setPaperForm({ ...paperForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 3KS02"
                    value={paperForm.subject_code}
                    onChange={(e) => setPaperForm({ ...paperForm, subject_code: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Semester III"
                    value={paperForm.semester}
                    onChange={(e) => setPaperForm({ ...paperForm, semester: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="2023-2024"
                    value={paperForm.academic_year}
                    onChange={(e) => setPaperForm({ ...paperForm, academic_year: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Paper Year</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="2023"
                    value={paperForm.paper_year}
                    onChange={(e) => setPaperForm({ ...paperForm, paper_year: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Exam Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="End Semester Examination"
                  value={paperForm.exam_type}
                  onChange={(e) => setPaperForm({ ...paperForm, exam_type: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {paperForm.id ? 'Update Paper' : 'Save & Upload Paper'}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowUploadModal(false); }} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Papers List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading question papers...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {papers.map((p) => (
              <div key={p.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span className="badge badge-purple">{p.semester || 'Sem III'}</span>
                    <span className="badge badge-cyan">{p.exam_type || 'End Sem'}</span>
                    <span className="badge badge-emerald">{p.question_count || 0} Questions</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.35rem' }}>
                    {p.subject}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    Year: {p.paper_year || p.academic_year} • Code: {p.subject_code || 'N/A'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button
                    onClick={() => {
                      setPaperForm(p);
                      setShowUploadModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => handleDeletePaper(p.id)}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Trash2 size={14} /> Delete
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
