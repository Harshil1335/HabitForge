import { useMemo } from 'react';

export const ContributionGraph = ({ contributions = [], totalCheckIns = 0 }) => {
  const levelColors = ['#eef1f6', '#cdd9f5', '#9db4ee', '#6a8ce6', '#3b6ef5', '#1e42b0'];
  
  const weeks = useMemo(() => {
    if (!contributions.length) return [];
    
    // Sort just in case
    const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
    
    const wks = [];
    let cur = [];
    
    const firstDow = new Date(`${sorted[0].date}T12:00:00Z`).getDay();
    for (let p = 0; p < firstDow; p++) cur.push(null);
    
    sorted.forEach(d => {
      // Create label
      const dt = new Date(`${d.date}T12:00:00Z`);
      d.label = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      d.color = levelColors[Math.min(d.level, 5)];
      
      cur.push(d);
      if (cur.length === 7) {
        wks.push(cur);
        cur = [];
      }
    });
    
    if (cur.length) {
      while (cur.length < 7) cur.push(null);
      wks.push(cur);
    }
    
    return wks;
  }, [contributions]);

  const cell = 15;
  const gap = 3;
  const labelW = 30;
  const wdNames = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  let lastMonth = -1;
  const monthEls = [];

  weeks.forEach((w, wi) => {
    const first = w.find((d) => d);
    if (first) {
      const m = new Date(`${first.date}T12:00:00Z`).getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        monthEls.push(
          <div
            key={`m${wi}`}
            style={{
              position: 'absolute',
              left: `${wi * (cell + gap)}px`,
              fontSize: '10.5px',
              color: '#9aa0ab',
              fontWeight: 600,
            }}
          >
            {new Date(`${first.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short' })}
          </div>
        );
      }
    }
  });

  return (
    <div className="rise" style={{ marginBottom: '60px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-.02em' }}>Your year in habits</h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>{totalCheckIns} check-ins this year</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#9aa0ab' }}>
          Less
          <div style={{ display: 'flex', gap: '3px', margin: '0 4px' }}>
            {levelColors.map((c, i) => (
              <div key={i} style={{ width: '11px', height: '11px', borderRadius: '3px', background: c }} />
            ))}
          </div>
          More
        </div>
      </div>

      <div style={{ minWidth: 'max-content' }}>
        <div style={{ position: 'relative', height: '15px', marginBottom: '6px', marginLeft: `${labelW}px` }}>
          {monthEls}
        </div>
        <div style={{ display: 'flex', gap: `${gap}px` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, width: `${labelW}px`, flex: 'none' }}>
            {wdNames.map((n, i) => (
              <div key={i} style={{ height: `${cell}px`, fontSize: '10px', color: '#9aa0ab', display: 'flex', alignItems: 'center' }}>
                {n}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: `${gap}px` }}>
            {weeks.map((w, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
                {w.map((d, di) => (
                  <div
                    key={di}
                    title={d ? `${d.label}\n${d.completed}/${d.scheduled} habits · ${d.completionRate}%` : ''}
                    style={{
                      width: `${cell}px`,
                      height: `${cell}px`,
                      borderRadius: '3.5px',
                      background: d ? d.color : 'transparent',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
