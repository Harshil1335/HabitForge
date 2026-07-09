import { useAuth } from '../../context/AuthContext';

export const HeroSection = ({ habits }) => {
  const { user } = useAuth();
  
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 16 ? 'Good afternoon' : 'Good evening';
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const scheduledToday = habits.length;
  const completedToday = habits.filter((h) => h.isCheckedInToday).length;
  const progressPct = scheduledToday === 0 ? 0 : Math.round((completedToday / scheduledToday) * 100);
  const ringDash = `${(progressPct / 100) * 97.4} 97.4`;
  
  const heroNudge =
    progressPct === 100
      ? 'Perfect day — every habit done.'
      : progressPct >= 60
      ? 'Almost there, keep it going.'
      : 'A few left to close out the day.';

  return (
    <div
      className="rise"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '32px',
        flexWrap: 'wrap',
        marginBottom: '52px',
      }}
    >
      <div style={{ maxWidth: '640px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#9aa0ab',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          {todayLabel}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: '60px',
            lineHeight: 1.02,
            fontWeight: 600,
            letterSpacing: '-.03em',
          }}
        >
          {greeting},<br />
          {firstName}.
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#6b7280',
            maxWidth: '440px',
          }}
        >
          You've completed <strong style={{ color: '#0e1116' }}>{completedToday} of {scheduledToday}</strong> habits today. {heroNudge}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ position: 'relative', width: '76px', height: '76px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '76px', height: '76px', transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e6e8ee" strokeWidth="3.2" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#3b6ef5"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={ringDash}
            />
          </svg>
          <div
            className="disp"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '19px', fontWeight: 700, lineHeight: 1 }}>{progressPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
