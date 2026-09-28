import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ShieldCheck, FileText, Layers, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'papers'
  const [papers, setPapers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Question Form State
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

  // Paper Form State
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
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:5000/api/papers').then((res) => res.json()),
      fetch('http://localhost:5000/api/questions').then((res) => res.json())
    ])
      .then(([papersData, questionsData]) => {
        setPapers(papersData);
        setQuestions(questionsData);
        if (papersData.length > 0 && !questionForm.paper_id) {
          setQuestionForm((prev) => ({ ...prev, paper_id: papersData[0].id }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin data:', err);
        setLoading(false);
      });
  };

  const showMessageBanner = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  };

  // Submit Question (Create or Edit)
  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.question_text || !questionForm.paper_id) {
      showMessageBanner('Please fill in Question Text and select a Paper.', true);
      return;
    }

    const isEdit = Boolean(questionForm.id);
    const url = isEdit
      ? `http://localhost:5000/api/questions/${questionForm.id}`
      : 'http://localhost:5000/api/questions';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionForm)
    })
      .then((res) => res.json())
      .then(() => {
        showMessageBanner(isEdit ? 'Question updated successfully!' : 'Question added successfully!');
        resetQuestionForm();
        loadData();
      })
      .catch((err) => showMessageBanner('Error saving question: ' + err.message, true));
  };

  // Delete Question
  const handleDeleteQuestion = (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    fetch(`http://localhost:5000/api/questions/${id}`, { method: 'DELETE' })
      .then(() => {
        showMessageBanner('Question deleted successfully!');
        loadData();
      })
      .catch((err) => showMessageBanner('Error deleting question: ' + err.message, true));
  };

  // Edit Question Click
  const handleEditQuestion = (q) => {
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

  const resetQuestionForm = () => {
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

  // Submit Paper (Create or Edit)
  const handleSavePaper = (e) => {
    e.preventDefault();
    if (!paperForm.subject) {
      showMessageBanner('Please enter Subject name.', true);
      return;
    }

    const isEdit = Boolean(paperForm.id);
    const url = isEdit
      ? `http://localhost:5000/api/papers/${paperForm.id}`
      : 'http://localhost:5000/api/papers';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paperForm)
    })
      .then((res) => res.json())
      .then(() => {
        showMessageBanner(isEdit ? 'Paper updated successfully!' : 'Paper added successfully!');
        resetPaperForm();
        loadData();
      })
      .catch((err) => showMessageBanner('Error saving paper: ' + err.message, true));
  };

  // Delete Paper
  const handleDeletePaper = (id) => {
    if (!window.confirm('Deleting a paper will also delete all associated questions. Proceed?')) return;

    fetch(`http://localhost:5000/api/papers/${id}`, { method: 'DELETE' })
      .then(() => {
        showMessageBanner('Paper deleted successfully!');
        loadData();
      })
      .catch((err) => showMessageBanner('Error deleting paper: ' + err.message, true));
  };

  const resetPaperForm = () => {
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
        {/* Admin Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <ShieldCheck size={14} /> Faculty & Admin Management Portal
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Admin Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('questions')}
              className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Layers size={16} /> Manage Questions
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`btn ${activeTab === 'papers' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <FileText size={16} /> Manage Papers
            </button>
          </div>
        </div>

        {/* Message Banner */}
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

        {/* TAB 1: MANAGE QUESTIONS */}
        {activeTab === 'questions' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Question Form Card */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="#38bdf8" /> {questionForm.id ? 'Edit Question' : 'Add New Question'}
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
                      placeholder="e.g. SECTION 3B"
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
                      placeholder="e.g. 1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Section Instruction (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={questionForm.section_instruction}
                    onChange={(e) => setQuestionForm({ ...questionForm, section_instruction: e.target.value })}
                    placeholder='e.g. "Solve any two questions"'
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Question Text (Preserve exact wording)</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={questionForm.question_text}
                    onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                    placeholder="Enter visible question text..."
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
                      placeholder="e.g. 7"
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
                    <button type="button" onClick={resetQuestionForm} className="btn btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Questions List */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
                Existing Database Questions ({questions.length})
              </h3>

              <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {questions.map((q) => (
                  <div key={q.id} className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{q.section}</span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Q{q.question_number}</span>
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{q.topic}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: 0, fontWeight: 500 }}>
                          {q.question_text}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => handleEditQuestion(q)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
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
        )}

        {/* TAB 2: MANAGE PAPERS */}
        {activeTab === 'papers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Paper Form */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="#38bdf8" /> {paperForm.id ? 'Edit Paper' : 'Add Question Paper'}
              </h3>

              <form onSubmit={handleSavePaper}>
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={paperForm.subject}
                    onChange={(e) => setPaperForm({ ...paperForm, subject: e.target.value })}
                    placeholder="e.g. Programming in C"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Code (Leave empty if not visible)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={paperForm.subject_code}
                    onChange={(e) => setPaperForm({ ...paperForm, subject_code: e.target.value })}
                    placeholder="e.g. 3KS02"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paperForm.semester}
                      onChange={(e) => setPaperForm({ ...paperForm, semester: e.target.value })}
                      placeholder="Semester III"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paperForm.academic_year}
                      onChange={(e) => setPaperForm({ ...paperForm, academic_year: e.target.value })}
                      placeholder="2023-2024"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Exam Type</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paperForm.exam_type}
                      onChange={(e) => setPaperForm({ ...paperForm, exam_type: e.target.value })}
                      placeholder="End Semester Examination"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Paper Year</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paperForm.paper_year}
                      onChange={(e) => setPaperForm({ ...paperForm, paper_year: e.target.value })}
                      placeholder="2023"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {paperForm.id ? 'Update Paper' : 'Save Paper'}
                  </button>

                  {paperForm.id && (
                    <button type="button" onClick={resetPaperForm} className="btn btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Papers List */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
                Question Papers ({papers.length})
              </h3>

              <div>
                {papers.map((p) => (
                  <div key={p.id} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                          {p.subject}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                          {p.semester || 'Sem III'} • {p.exam_type || 'End Sem'} • {p.question_count || 0} Questions
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => setPaperForm(p)} className="btn btn-secondary btn-sm">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeletePaper(p.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
