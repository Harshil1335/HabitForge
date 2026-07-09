export const RecentBadges = ({ badges = [] }) => {
  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 600, letterSpacing: '-.02em' }}>
        Recent badges
      </h2>
      
      {badges.length === 0 ? (
        <div style={{ color: '#9aa0ab', fontSize: '14px', fontStyle: 'italic', padding: '10px 0' }}>
          No badges unlocked yet. Keep going!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {badges.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  flex: 'none',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '19px',
                }}
              >
                {a.icon}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: '12px', color: '#9aa0ab' }}>
                  {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : 'Unlocked'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
