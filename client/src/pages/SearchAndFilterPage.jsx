import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import { Search, Filter, Layers, X, Tag } from 'lucide-react';

const TOPIC_OPTIONS = [
  'All Topics',
  'Arrays',
  'Strings',
  'Functions',
  'Pointers',
  'Structures',
  'File Handling',
  'Variables',
  'Math Functions'
];

export default function SearchAndFilterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch questions on search term or topic change
  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:5000/api/questions';

    if (searchTerm.trim()) {
      url = `http://localhost:5000/api/search?q=${encodeURIComponent(searchTerm.trim())}`;
    } else if (selectedTopic !== 'All Topics') {
      url = `http://localhost:5000/api/questions?topic=${encodeURIComponent(selectedTopic)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // If searching and a topic is selected, filter client-side as well
        let results = data;
        if (selectedTopic !== 'All Topics' && searchTerm.trim()) {
          results = data.filter((q) => q.topic === selectedTopic);
        }
        setQuestions(results);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error searching questions:', err);
        setLoading(false);
      });
  }, [searchTerm, selectedTopic]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTopic('All Topics');
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Page Title Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Question Search & Topic Filter
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Search previous year questions by wording, code snippets, topics, sections, or academic years.
          </p>
        </div>

        {/* Powerful Search Bar */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={22} color="#94a3b8" style={{ position: 'absolute', left: '1.25rem' }} />
            <input
              type="text"
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search questions (e.g. "pointer", "structure", "prime", "string", "array", "file")...'
              style={{
                paddingLeft: '3.25rem',
                paddingRight: searchTerm ? '3rem' : '1rem',
                fontSize: '1.05rem',
                height: '52px',
                borderRadius: '12px'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Quick Example Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#94a3b8' }}>
            <span>Quick searches:</span>
            {['pointer', 'structure', 'prime', 'vowels', 'file', 'strcpy'].map((example) => (
              <button
                key={example}
                onClick={() => setSearchTerm(example)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#38bdf8',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        {/* Topic Filters */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#38bdf8" /> Topic Filter
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TOPIC_OPTIONS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`btn ${selectedTopic === topic ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ borderRadius: '9999px', padding: '0.4rem 1rem' }}
              >
                <Tag size={13} /> {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            {loading ? 'Searching...' : `Found ${questions.length} Question${questions.length === 1 ? '' : 's'}`}
          </h3>

          {(searchTerm || selectedTopic !== 'All Topics') && (
            <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Question Results List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Searching database...
          </div>
        ) : questions.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No matching questions found for "{searchTerm || selectedTopic}".
          </div>
        ) : (
          <div>
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} showPaperMeta={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
