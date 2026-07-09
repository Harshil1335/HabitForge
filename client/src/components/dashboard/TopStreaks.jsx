export const TopStreaks = ({ streaks = [] }) => {
  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 600, letterSpacing: '-.02em' }}>
        Top streaks
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {streaks.length === 0 ? (
          <div style={{ padding: '16px 0', fontSize: '13px', color: '#6b7280' }}>
            No active streaks yet.
          </div>
        ) : (
          streaks.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid rgba(14,17,22,.06)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  flex: 'none',
                  borderRadius: '50%',
                  background: s.color,
                }}
              />
              <div style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>{s.name}</div>
              <div className="disp" style={{ fontSize: '15px', fontWeight: 600 }}>
                {s.streak}
                <span style={{ color: '#9aa0ab', fontWeight: 500, fontSize: '12px' }}>d</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
