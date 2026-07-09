export const WeeklyOverview = ({ progressPct = 0, weeklyData }) => {
  const defaultDays = [
    { weekday: 'Mon', pct: 0 },
    { weekday: 'Tue', pct: 0 },
    { weekday: 'Wed', pct: 0 },
    { weekday: 'Thu', pct: 0 },
    { weekday: 'Fri', pct: 0 },
    { weekday: 'Sat', pct: 0 },
    { weekday: 'Sun', pct: 0 },
  ];

  const days = weeklyData?.days
    ? weeklyData.days.map(d => ({ weekday: d.weekday, pct: d.completionRate }))
    : defaultDays;

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(14,17,22,.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Weekly Progress</div>
        <div className="disp" style={{ fontSize: '24px', fontWeight: 600, color: '#0e1116', letterSpacing: '-.02em' }}>
          {progressPct}<span style={{ fontSize: '14px', color: '#9aa0ab' }}>%</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        {days.map((d, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ width: '100%', height: '80px', background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
              <div style={{ width: '100%', background: '#3b6ef5', height: `${d.pct}%`, borderRadius: '6px' }} />
            </div>
            <div style={{ fontSize: '11.5px', color: '#9aa0ab', fontWeight: 600 }}>{d.weekday}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
