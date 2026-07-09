export const AchievementCard = ({ achievement }) => {
  const { icon, name, description, bg = '#fef3c7', isUnlocked, unlockedAt, progress } = achievement;
  
  const displayProgress = progress?.current || 0;
  const target = progress?.target || 1;
  const progressPct = progress?.percentage || 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '24px',
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(14,17,22,.06)',
        opacity: isUnlocked ? 1 : 0.6,
        filter: isUnlocked ? 'none' : 'grayscale(0.8)',
        transition: 'all .2s',
      }}
    >
      <div
        className="disp"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: bg,
          color: bg === '#fef3c7' ? '#d97706' : 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          flex: 'none',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <div style={{ fontWeight: 600, fontSize: '16px', color: '#0e1116' }}>{name}</div>
          {isUnlocked && unlockedAt ? (
            <div style={{ fontSize: '11px', color: '#9aa0ab', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, background: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>
              Locked
            </div>
          )}
        </div>
        <div style={{ fontSize: '13.5px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
          {description}
        </div>
        
        {!isUnlocked && target > 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9aa0ab', marginBottom: '6px', fontWeight: 500 }}>
              <span>Progress</span>
              <span>{displayProgress} / {target}</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: '#9ca3af', borderRadius: '3px' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
