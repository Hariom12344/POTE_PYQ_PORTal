import React from 'react';
import { Tag, Award, Copy, Check, Repeat } from 'lucide-react';

export default function QuestionCard({ question, showPaperMeta = false, isRepeated = false, repeatedYears = [] }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(question.question_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if text has code block or multiline code format
  const isCodeBlock = question.question_text.includes('int ') || 
                      question.question_text.includes('printf') || 
                      question.question_text.includes('*p=') ||
                      question.question_text.includes('#include');

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1rem', position: 'relative' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
            {question.section}
          </span>

          <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
            Q{question.question_number}
          </span>

          <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
            <Tag size={12} /> {question.topic}
          </span>

          {isRepeated && (
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
              <Repeat size={12} /> Repeated Question
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {question.marks && (
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Award size={14} /> [{question.marks} Marks]
            </span>
          )}

          <button 
            onClick={handleCopyText} 
            title="Copy question text"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.5rem' }}
          >
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Show Paper Title if search/filter mode */}
      {showPaperMeta && question.subject && (
        <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.5rem', fontWeight: 600 }}>
          {question.subject} {question.academic_year ? `(${question.academic_year})` : ''} {question.semester ? `• ${question.semester}` : ''}
        </div>
      )}

      {/* Question Wording */}
      <div style={{ fontSize: '0.975rem', color: '#f8fafc', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {question.question_text}
      </div>

      {/* Repeated Occurrences List */}
      {isRepeated && repeatedYears.length > 0 && (
        <div style={{ 
          marginTop: '0.75rem', 
          padding: '0.5rem 0.85rem', 
          background: 'rgba(16, 185, 129, 0.08)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#34d399'
        }}>
          <strong>Appeared in:</strong> {repeatedYears.join(', ')}
        </div>
      )}
    </div>
  );
}
