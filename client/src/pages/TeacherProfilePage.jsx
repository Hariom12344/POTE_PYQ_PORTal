import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Building, ShieldCheck, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function TeacherProfilePage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    college: user?.college || '',
    branch: user?.branch || '',
    academicYear: user?.academicYear || ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      await updateProfile(formData);
      setMessage('Faculty profile updated successfully!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Faculty Profile & Settings
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Faculty Profile Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Update your professional contact details and academic designation.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
          {message && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <CheckCircle size={18} />
              {message}
            </div>
          )}

          {error && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Account Role Badge (Read only) */}
            <div className="form-group" style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Account Role (Role Modification Locked)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}>
                  <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} /> {user?.role} ACCOUNT
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  • Security policy prevents role modification
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', opacity: 0.7, cursor: 'not-allowed' }}
                  value={user?.email || ''}
                  disabled
                />
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="mobile"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.mobile}
                  onChange={handleChange}
                />
                <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">College / Institute</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.college}
                  onChange={handleChange}
                  required
                />
                <Building size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <input
                  type="text"
                  name="branch"
                  className="form-input"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  name="academicYear"
                  className="form-input"
                  value={formData.academicYear}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
            >
              {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
