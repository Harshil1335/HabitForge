import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f8fa' }}>
      <h1 className="disp" style={{ fontSize: '48px', margin: '0 0 16px', letterSpacing: '-.02em' }}>404</h1>
      <p style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 32px' }}>Page not found.</p>
      <Link
        to="/dashboard"
        className="disp"
        style={{
          background: '#0e1116',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 600,
        }}
      >
        Go Home
      </Link>
    </div>
  );
};
