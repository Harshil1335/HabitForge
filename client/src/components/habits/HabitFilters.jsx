export const HabitFilters = ({ searchQuery, setSearchQuery, frequencyFilter, setFrequencyFilter, statusFilter, setStatusFilter }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
      <div style={{ flex: '1 1 200px' }}>
        <input
          type="text"
          placeholder="Search habits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(14,17,22,.1)',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          value={frequencyFilter}
          onChange={(e) => setFrequencyFilter(e.target.value)}
          style={{
            padding: '10px 32px 10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(14,17,22,.1)',
            fontSize: '13.5px',
            background: '#fff',
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'inherit',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="ALL">All Frequencies</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKDAYS">Weekdays</option>
          <option value="CUSTOM">Custom</option>
        </select>

        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: statusFilter === 'ACTIVE' ? '#fff' : 'transparent',
              color: statusFilter === 'ACTIVE' ? '#0e1116' : '#6b7280',
              fontWeight: statusFilter === 'ACTIVE' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: statusFilter === 'ACTIVE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all .2s',
            }}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('ARCHIVED')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: statusFilter === 'ARCHIVED' ? '#fff' : 'transparent',
              color: statusFilter === 'ARCHIVED' ? '#0e1116' : '#6b7280',
              fontWeight: statusFilter === 'ARCHIVED' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: statusFilter === 'ARCHIVED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all .2s',
            }}
          >
            Archived
          </button>
        </div>
      </div>
    </div>
  );
};
