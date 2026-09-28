import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Building, BookOpen, Phone, AlertCircle, Shield, GraduationCap } from 'lucide-react';

export default function RegisterPage({ navigate }) {
  const { register } = useAuth();
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'TEACHER'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    college: 'P. R. Pote Patil College of Engineering & Management, Amravati',
    branch: 'Computer Science Engineering',
    academicYear: '3rd Year (Sem V)',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const user = await register({
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        college: formData.college,
        branch: formData.branch,
        academicYear: formData.academicYear,
        password: formData.password,
        role // 'STUDENT' or 'TEACHER'
      });

      if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 6px 20px rgba(56, 189, 248, 0.35)',
              color: '#0f172a'
            }}>
              <UserPlus size={28} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.35rem' }}>
              Create Your Account
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
              Join CSE PYQ HUB • Choose your portal role below
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.35rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.75rem'
          }}>
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              style={{
                padding: '0.85rem',
                borderRadius: '9px',
                border: 'none',
                background: role === 'STUDENT' ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' : 'transparent',
                color: role === 'STUDENT' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: role === 'STUDENT' ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none'
              }}
            >
              <GraduationCap size={20} /> Student Registration
            </button>

            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              style={{
                padding: '0.85rem',
                borderRadius: '9px',
                border: 'none',
                background: role === 'TEACHER' ? 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' : 'transparent',
                color: role === 'TEACHER' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: role === 'TEACHER' ? '0 4px 12px rgba(129, 140, 248, 0.3)' : 'none'
              }}
            >
              <Shield size={20} /> Teacher Registration
            </button>
          </div>

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
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder={role === 'STUDENT' ? 'e.g. Aniket Sharma' : 'e.g. Dr. Rajesh K. Verma'}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="name@pote.edu.in"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                  <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
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
                <label className="form-label">Branch / Department</label>
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
                <label className="form-label">{role === 'STUDENT' ? 'Academic Year' : 'Designation'}</label>
                <input
                  type="text"
                  name="academicYear"
                  className="form-input"
                  placeholder={role === 'STUDENT' ? 'e.g. 3rd Year (Sem V)' : 'e.g. Assistant Professor'}
                  value={formData.academicYear}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
            >
              {submitting ? 'Registering...' : `Register as ${role === 'STUDENT' ? 'Student' : 'Teacher'}`}
            </button>
          </form>

          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#94a3b8'
          }}>
            Already registered?{' '}
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign In here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
