export const StatsGrid = ({ summary }) => {
  const cards = [
    { label: 'Current streak', value: summary?.currentStreak || '0', unit: 'days', deltaColor: '#2b54d4' },
    { label: 'Best streak', value: summary?.bestStreak || '0', unit: 'days', deltaColor: '#9aa0ab' },
    { label: 'Completion rate', value: summary?.completionRate || '0', unit: '%', deltaColor: '#2b54d4' },
    { label: 'Total check-ins', value: summary?.totalCheckIns || '0', unit: '', deltaColor: '#9aa0ab' },
  ];

  return (
    <div
      className="rise"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid rgba(14,17,22,.1)',
        borderBottom: '1px solid rgba(14,17,22,.1)',
        marginBottom: '56px',
      }}
    >
      {cards.map((c, i) => (
        <div key={i} style={{ padding: '26px 26px 24px', borderLeft: i > 0 ? '1px solid rgba(14,17,22,.07)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#6b7280', fontSize: '12px', fontWeight: 600, letterSpacing: '.02em' }}>
            {c.label}
          </div>
          <div
            className="disp"
            style={{ fontSize: '42px', fontWeight: 600, letterSpacing: '-.03em', marginTop: '14px', lineHeight: 1 }}
          >
            {c.value}
            <span style={{ fontSize: '16px', color: '#9aa0ab', fontWeight: 500 }}> {c.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
