export const HabitCard = ({ habit, onCheckIn, onUndo, onEdit, onArchive, onDelete, onRestore }) => {
  const isArchived = !!habit.archivedAt;
  const isDone = habit.isCheckedInToday;
  
  const ringColor = isDone ? '#3b6ef5' : '#ccd0da';
  const fillColor = isDone ? '#3b6ef5' : '#fff';
  const checkDisplay = isDone ? 'block' : 'none';
  const nameStyle = isDone ? { color: '#9aa0ab', textDecoration: 'line-through' } : {};
  
  if (isArchived) {
    nameStyle.color = '#9aa0ab';
  }

  const handleToggle = () => {
    if (isArchived) return;
    if (isDone) onUndo(habit.id);
    else onCheckIn(habit.id);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 4px',
        borderBottom: '1px solid rgba(14,17,22,.06)',
        opacity: isArchived ? 0.6 : 1,
      }}
    >
      <button
        onClick={handleToggle}
        disabled={isArchived}
        style={{
          width: '28px',
          height: '28px',
          flex: 'none',
          borderRadius: '50%',
          border: `2px solid ${isArchived ? '#e5e7eb' : ringColor}`,
          background: isArchived ? '#f3f4f6' : fillColor,
          cursor: isArchived ? 'not-allowed' : 'pointer',
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
      
      <div style={{ width: '12px', height: '12px', flex: 'none', borderRadius: '4px', background: habit.color }} />
      
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', ...nameStyle }}>{habit.name}</div>
          <div style={{ fontSize: '10px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#6b7280', fontWeight: 600 }}>
            {habit.frequencyType}
          </div>
        </div>
        <div
          style={{
            fontSize: '12.5px',
            color: '#9aa0ab',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {habit.description}
        </div>
      </div>
      
      <div
        className="disp"
        style={{ flex: 'none', fontSize: '13px', fontWeight: 600, color: '#374151', minWidth: '40px', textAlign: 'right' }}
      >
        {habit.currentStreak !== undefined ? habit.currentStreak : '—'}
        <span style={{ color: '#9aa0ab', fontWeight: 500, marginLeft: '2px' }}>d</span>
      </div>
      
      <div style={{ display: 'flex', gap: '4px', flex: 'none' }}>
        {!isArchived ? (
          <>
            <button
              title="Edit"
              onClick={() => onEdit(habit)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                border: '1px solid rgba(14,17,22,.1)',
                background: '#fff',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✎
            </button>
            <button
              title="Archive"
              onClick={() => onArchive(habit.id)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                border: '1px solid rgba(14,17,22,.1)',
                background: '#fff',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ⌵
            </button>
          </>
        ) : (
          <button
            title="Restore"
            onClick={() => onRestore(habit.id)}
            style={{
              padding: '0 8px',
              height: '28px',
              borderRadius: '7px',
              border: '1px solid rgba(14,17,22,.1)',
              background: '#fff',
              color: '#3b6ef5',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Restore
          </button>
        )}
        <button
          title="Delete"
          onClick={() => onDelete(habit.id)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            border: '1px solid rgba(220,38,38,.2)',
            background: '#fef2f2',
            color: '#dc2626',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 800,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};
