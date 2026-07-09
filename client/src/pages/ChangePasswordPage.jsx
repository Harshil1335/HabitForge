import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { DashboardLayout } from '../layouts/DashboardLayout';
import '../styles/auth.css';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      if (res.success) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="rise" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/profile')}
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
            ← Back to Profile
          </button>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 8px' }}>
          Change Password
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 32px' }}>
          Update your account password securely.
        </p>

        <div className="auth-card" style={{ maxWidth: '100%', padding: '32px' }}>

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
              <label className="auth-label" htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="auth-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="auth-field" style={{ marginTop: '8px' }}>
              <label className="auth-label" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="auth-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="auth-button disp" disabled={isSubmitting} style={{ marginTop: '16px' }}>
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
