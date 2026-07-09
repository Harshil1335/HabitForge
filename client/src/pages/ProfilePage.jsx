import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { DashboardLayout } from '../layouts/DashboardLayout';
import '../styles/auth.css';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.updateProfile({ name });
      if (res.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="rise" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              padding: '8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 8px' }}>
          Profile
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 32px' }}>
          Manage your personal information.
        </p>

        <div className="auth-card" style={{ maxWidth: '100%', padding: '32px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div
              className="disp"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#0e1116',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '22px',
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>{user?.name}</div>
              <div style={{ color: '#6b7280', fontSize: '13.5px', marginTop: '2px' }}>Member since {memberSince}</div>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div style={{
              background: '#ecfdf5',
              color: '#047857',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 500,
              marginBottom: '16px',
              border: '1px solid #34d399'
            }}>
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="auth-input"
                value={user?.email || ''}
                disabled
                style={{ background: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
              />
              <span style={{ fontSize: '12px', color: '#9aa0ab' }}>Email changes are currently disabled.</span>
            </div>

            <button type="submit" className="auth-button disp" disabled={isSubmitting} style={{ marginTop: '16px' }}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
