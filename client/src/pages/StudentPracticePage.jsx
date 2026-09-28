import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, BookOpen, Clock, CheckCircle, ArrowRight, Play, AlertCircle } from 'lucide-react';

export default function StudentPracticePage({ navigate }) {
  const { token } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Mock quiz questions per test
  const quizQuestions = [
    {
      id: 1,
      question: 'Which header file is required for printf() and scanf() in C?',
      options: ['<stdlib.h>', '<stdio.h>', '<conio.h>', '<string.h>'],
      correct: 1
    },
    {
      id: 2,
      question: 'What is the correct syntax to declare a pointer to an integer in C?',
      options: ['int p*;', 'int *p;', 'ptr int p;', 'int &p;'],
      correct: 1
    },
    {
      id: 3,
      question: 'Which data structure follows LIFO (Last In First Out)?',
      options: ['Queue', 'Linked List', 'Stack', 'Tree'],
      correct: 2
    },
    {
      id: 4,
      question: 'What is the size of an int data type on a standard 64-bit system?',
      options: ['2 bytes', '4 bytes', '8 bytes', '1 byte'],
      correct: 1
    },
    {
      id: 5,
      question: 'Which function is used to dynamically allocate memory in C?',
      options: ['alloc()', 'malloc()', 'new', 'create()'],
      correct: 1
    }
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/student/practice', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTests(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading practice tests:', err);
        setLoading(false);
      });
  }, [token]);

  const handleStartTest = (test) => {
    setActiveTest(test);
    setAnswers({});
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    setAnswers({ ...answers, [qId]: optionIdx });
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        score += 2; // 2 marks per question
      }
    });

    const total_marks = quizQuestions.length * 2;

    setSubmitting(true);

    try {
      await fetch('http://localhost:5000/api/student/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test_title: activeTest.title,
          subject: activeTest.subject,
          score,
          total_marks
        })
      });

      setActiveTest(null);
      navigate('/student/results');
    } catch (err) {
      alert('Error submitting test: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Award size={14} /> Academic Practice & Quiz Module
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Practice Tests & Self Assessment
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Test your concept mastery with timed subject quizzes based on PYQs.
          </p>
        </div>

        {/* ACTIVE TEST MODAL / INTERFACE */}
        {activeTest ? (
          <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '720px', margin: '0 auto', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <span className="badge badge-cyan">{activeTest.subject}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '0.35rem 0 0 0' }}>
                  {activeTest.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveTest(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel Test
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              {quizQuestions.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: '1.75rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                    Q{idx + 1}. {q.question}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: answers[q.id] === optIdx ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: answers[q.id] === optIdx ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                          color: answers[q.id] === optIdx ? '#38bdf8' : '#cbd5e1',
                          fontWeight: answers[q.id] === optIdx ? 700 : 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitQuiz}
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {submitting ? 'Submitting Test...' : 'Submit Practice Test'}
            </button>
          </div>
        ) : (
          /* LIST OF TESTS */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {tests.map((t) => (
              <div key={t.id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-emerald">{t.subject}</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0.5rem 0' }}>
                    {t.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '1.25rem', color: '#94a3b8', fontSize: '0.875rem', margin: '1rem 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={16} color="#38bdf8" /> 5 Questions
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={16} color="#fbbf24" /> {t.duration_minutes} Mins
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(t)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  <Play size={16} /> Start Practice Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
