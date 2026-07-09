export const TodayHabits = ({ habits, toggleHabit }) => {
  return (
    <div className="rise">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-.02em' }}>Today</h2>
        <span style={{ fontSize: '12.5px', color: '#9aa0ab' }}>Tap to check in or undo</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {habits.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13.5px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed rgba(14,17,22,.12)' }}>
            No habits scheduled for today.<br/>Enjoy your day!
          </div>
        ) : (
          habits.map((h) => {
            const isDone = h.isCheckedInToday;
            const ringColor = isDone ? '#3b6ef5' : '#ccd0da';
            const fillColor = isDone ? '#3b6ef5' : '#fff';
            const checkDisplay = isDone ? 'block' : 'none';
            const nameStyle = isDone ? { color: '#9aa0ab', textDecoration: 'line-through' } : {};

            return (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 4px',
                  borderBottom: '1px solid rgba(14,17,22,.06)',
                }}
              >
                <button
                  onClick={() => toggleHabit(h.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    flex: 'none',
                    borderRadius: '50%',
                    border: `2px solid ${ringColor}`,
                    background: fillColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all .18s',
                  }}
                >
                  <span
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 800,
                      display: checkDisplay,
                      animation: isDone ? 'pop .2s' : 'none',
                    }}
                  >
                    ✓
                  </span>
                </button>
                <div style={{ width: '8px', height: '8px', flex: 'none', borderRadius: '50%', background: h.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', ...nameStyle }}>{h.name}</div>
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: '#9aa0ab',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h.description}
                  </div>
                </div>
                <div
                  className="disp"
                  style={{ flex: 'none', fontSize: '13px', fontWeight: 600, color: '#374151' }}
                >
                  {h.currentStreak !== undefined ? h.currentStreak : '—'}
                  <span style={{ color: '#9aa0ab', fontWeight: 500, marginLeft: '2px' }}>d</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flex: 'none', opacity: 0.55 }}>
                  <button
                    title="Edit via Habits Page"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '7px',
                      border: '1px solid rgba(14,17,22,.1)',
                      background: '#fff',
                      color: '#6b7280',
                      cursor: 'not-allowed',
                      fontSize: '12px',
                    }}
                  >
                    ✎
                  </button>
                  <button
                    title="Archive via Habits Page"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '7px',
                      border: '1px solid rgba(14,17,22,.1)',
                      background: '#fff',
                      color: '#6b7280',
                      cursor: 'not-allowed',
                      fontSize: '12px',
                    }}
                  >
                    ⌵
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
