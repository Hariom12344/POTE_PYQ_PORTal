import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, Layers, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

export default function TeacherQuestionsPage() {
  const { token } = useAuth();
  const [papers, setPapers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    id: null,
    paper_id: '',
    section: 'SECTION 3B',
    section_instruction: '',
    question_number: '1',
    question_text: '',
    marks: '7',
    topic: 'Arrays',
    difficulty: 'Medium'
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:5000/api/teacher/pyqs', { headers: { 'Authorization': `Bearer ${token}` } }).then((res) => res.json()),
      fetch('http://localhost:5000/api/questions').then((res) => res.json())
    ])
      .then(([papersData, questionsData]) => {
        if (Array.isArray(papersData)) setPapers(papersData);
        if (Array.isArray(questionsData)) setQuestions(questionsData);
        if (Array.isArray(papersData) && papersData.length > 0 && !questionForm.paper_id) {
          setQuestionForm((prev) => ({ ...prev, paper_id: papersData[0].id }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const showBanner = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.question_text || !questionForm.paper_id) {
      showBanner('Question text and Paper are required.', true);
      return;
    }

    const isEdit = Boolean(questionForm.id);
    const url = isEdit
      ? `http://localhost:5000/api/teacher/questions/${questionForm.id}`
      : 'http://localhost:5000/api/teacher/questions';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(questionForm)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save question');
        return res.json();
      })
      .then(() => {
        showBanner(isEdit ? 'Question updated successfully!' : 'Question added successfully!');
        resetForm();
        loadData();
      })
      .catch((err) => showBanner(err.message, true));
  };

  const handleDeleteQuestion = (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    fetch(`http://localhost:5000/api/teacher/questions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete question');
        return res.json();
      })
      .then(() => {
        showBanner('Question deleted successfully!');
        loadData();
      })
      .catch((err) => showBanner(err.message, true));
  };

  const handleEditClick = (q) => {
    setQuestionForm({
      id: q.id,
      paper_id: q.paper_id,
      section: q.section,
      section_instruction: q.section_instruction || '',
      question_number: q.question_number,
      question_text: q.question_text,
      marks: q.marks || '',
      topic: q.topic,
      difficulty: q.difficulty || 'Medium'
    });
  };

  const resetForm = () => {
    setQuestionForm({
      id: null,
      paper_id: papers[0]?.id || '',
      section: 'SECTION 3B',
      section_instruction: '',
      question_number: '1',
      question_text: '',
      marks: '7',
      topic: 'Arrays',
      difficulty: 'Medium'
    });
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Faculty Portal
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Question Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Add, edit, or remove exam questions associated with question papers.
          </p>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Question Form */}
          <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="#818cf8" /> {questionForm.id ? 'Edit Question' : 'Add New Question'}
            </h3>

            <form onSubmit={handleSaveQuestion}>
              <div className="form-group">
                <label className="form-label">Question Paper</label>
                <select
                  className="form-select"
                  value={questionForm.paper_id}
                  onChange={(e) => setQuestionForm({ ...questionForm, paper_id: e.target.value })}
                  required
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.subject} ({p.academic_year || p.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    className="form-input"
                    value={questionForm.section}
                    onChange={(e) => setQuestionForm({ ...questionForm, section: e.target.value })}
                    placeholder="SECTION 3B"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Q. Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={questionForm.question_number}
                    onChange={(e) => setQuestionForm({ ...questionForm, question_number: e.target.value })}
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  placeholder="Enter verbatim question text..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input
                    type="text"
                    className="form-input"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <select
                    className="form-select"
                    value={questionForm.topic}
                    onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                  >
                    {['Arrays', 'Strings', 'Functions', 'Pointers', 'Structures', 'File Handling', 'Variables', 'Math Functions', 'Stacks & Queues', 'Trees'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {questionForm.id ? 'Update Question' : 'Save Question'}
                </button>
                {questionForm.id && (
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing Questions List */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
              Database Questions ({questions.length})
            </h3>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {questions.map((q) => (
                <div key={q.id} className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{q.section}</span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Q{q.question_number}</span>
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{q.topic}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: 0 }}>{q.question_text}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => handleEditClick(q)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="btn btn-danger btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
