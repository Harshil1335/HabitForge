import { useEffect } from 'react';

export const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmText, 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel, 
  isDanger = false,
  isExecuting = false
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(14, 17, 22, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="rise"
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h2 id="confirm-modal-title" style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 600 }}>
          {title}
        </h2>
        <p style={{ margin: '0 0 24px', color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={isExecuting}
            style={{
              background: 'transparent',
              border: '1px solid #d1d5db',
              color: '#374151',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 500,
              cursor: isExecuting ? 'not-allowed' : 'pointer',
              opacity: isExecuting ? 0.7 : 1,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isExecuting}
            className="disp"
            style={{
              background: isDanger ? '#dc2626' : '#0e1116',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: isExecuting ? 'not-allowed' : 'pointer',
              opacity: isExecuting ? 0.7 : 1,
            }}
          >
            {isExecuting ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
