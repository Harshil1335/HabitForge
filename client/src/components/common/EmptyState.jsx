export const EmptyState = ({ title, description, actionText, onAction, icon = '📂' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 20px',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '16px',
        border: '1px dashed rgba(14,17,22,.12)',
        color: '#6b7280',
      }}
      className="rise"
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '16px',
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0e1116', margin: '0 0 4px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13.5px', margin: '0 0 24px', maxWidth: '300px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="disp"
          style={{
            background: '#0e1116',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
