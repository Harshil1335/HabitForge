import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use real authenticated user info, with fallback
  const userName = user?.name || 'User';
  
  // Extract initials
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Habits', path: '/habits' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Achievements', path: '/achievements' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(247,248,250,.8)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(14,17,22,.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            padding: '16px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', textDecoration: 'none' }}>
              <div
                className="disp"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  background: '#0e1116',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                H
              </div>
              <span
                className="disp"
                style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-.02em' }}
              >
                HabitForge
              </span>
            </Link>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px' }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    padding: '7px 13px',
                    borderRadius: '8px',
                    color: isActive ? '#0e1116' : '#6b7280',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13.5px',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(14, 17, 22, 0.04)' : 'transparent',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
          <div 
            style={{ marginLeft: 'auto', position: 'relative' }}
            ref={dropdownRef}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '11px',
                background: 'transparent',
                border: 'none',
                padding: '4px',
                borderRadius: '20px',
                cursor: 'pointer',
                outline: 'none'
              }}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                {userName}
              </span>
              <div
                className="disp"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#0e1116',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '12.5px',
                }}
              >
                {initials}
              </div>
            </button>

            {isDropdownOpen && (
              <div
                className="rise"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '220px',
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px rgba(14, 17, 22, 0.08)',
                  border: '1px solid rgba(14, 17, 22, 0.06)',
                  overflow: 'hidden',
                  zIndex: 30,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(14,17,22,.06)' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0e1116', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </div>
                </div>
                
                <div style={{ padding: '8px' }}>
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: '#374151',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f7f8fa'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/profile/change-password"
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: '#374151',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f7f8fa'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Change Password
                  </Link>
                </div>
                
                <div style={{ padding: '8px', borderTop: '1px solid rgba(14,17,22,.06)' }}>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'block',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: '#b91c1c',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '56px 40px 72px' }}>
        {children}
      </main>
    </div>
  );
};
