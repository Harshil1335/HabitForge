import { useState, useEffect } from 'react';

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const HabitFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🌟');
  const [color, setColor] = useState('#3b6ef5');
  const [frequencyType, setFrequencyType] = useState('DAILY');
  const [targetDays, setTargetDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setIcon(initialData.icon || '🌟');
        setColor(initialData.color || '#3b6ef5');
        setFrequencyType(initialData.frequencyType || 'DAILY');
        setTargetDays(initialData.targetDays || [0, 1, 2, 3, 4, 5, 6]);
      } else {
        setName('');
        setDescription('');
        setIcon('🌟');
        setColor('#3b6ef5');
        setFrequencyType('DAILY');
        setTargetDays([0, 1, 2, 3, 4, 5, 6]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const toggleDay = (day) => {
    setTargetDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day).sort();
      } else {
        return [...prev, day].sort();
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    let finalTargetDays = targetDays;
    if (frequencyType === 'DAILY') {
      finalTargetDays = [0, 1, 2, 3, 4, 5, 6];
    } else if (frequencyType === 'WEEKDAYS') {
      finalTargetDays = [1, 2, 3, 4, 5];
    } else {
      if (targetDays.length === 0) {
        setError('Custom frequency requires at least one selected day');
        return;
      }
      finalTargetDays = [...new Set(targetDays)].sort();
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      frequencyType,
      targetDays: finalTargetDays,
    };
    
    onSubmit(payload, setError);
  };

  if (!isOpen) return null;

  const isEdit = !!initialData;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(14, 17, 22, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="rise"
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 600 }}>
          {isEdit ? 'Edit Habit' : 'Create Habit'}
        </h2>
        
        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Run"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 3km around the park"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Icon</label>
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                maxLength={2}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Frequency</label>
            <select
              value={frequencyType}
              onChange={e => setFrequencyType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: '#fff' }}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKDAYS">Weekdays</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {frequencyType === 'CUSTOM' && (
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Target Days</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {WEEKDAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    style={{
                      flex: 1,
                      minWidth: '40px',
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: `1px solid ${targetDays.includes(day.value) ? color : '#d1d5db'}`,
                      background: targetDays.includes(day.value) ? color : '#fff',
                      color: targetDays.includes(day.value) ? '#fff' : '#6b7280',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all .2s'
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="disp"
              style={{
                background: '#0e1116',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
