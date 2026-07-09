import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitFilters } from '../components/habits/HabitFilters';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { AppCredit } from '../components/common/AppCredit';
import { habitApi } from '../api/habitApi';
import { analyticsApi } from '../api/analyticsApi';
import { getBrowserTimezone } from '../utils/timezone';

export const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, habitId: null });
  const [stats, setStats] = useState({ bestStreak: '—', avgCompletion: '—', bestStreakHabit: '' });

  // Fetch habits whenever statusFilter changes
  useEffect(() => {
    let isMounted = true;
    const fetchHabits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const timezone = getBrowserTimezone();
        
        const [habitsData, summaryData, perfData] = await Promise.all([
          habitApi.getHabits(statusFilter.toLowerCase(), timezone),
          analyticsApi.getSummary(timezone, '30d').catch(() => null),
          analyticsApi.getHabitPerformance(timezone, 'year', 'longestStreak').catch(() => null)
        ]);

        if (isMounted) {
          setHabits(habitsData);
          
          let maxStreak = '—';
          let avgComp = '—';
          let bestHabitName = '';

          if (summaryData && summaryData.summary) {
            avgComp = summaryData.summary.completionRate;
            maxStreak = summaryData.summary.bestStreak; // fallback
          }

          if (perfData && perfData.habits && perfData.habits.length > 0) {
            // Inject current streak into the raw habits list so the cards can display it
            for (const h of habitsData) {
              const perfMatch = perfData.habits.find(p => p.id === h.id);
              if (perfMatch) {
                h.currentStreak = perfMatch.currentStreak;
              }
            }

            let maxHabit = perfData.habits[0];
            for (const h of perfData.habits) {
              if (h.bestStreak > maxHabit.bestStreak) {
                maxHabit = h;
              }
            }
            maxStreak = maxHabit.bestStreak;
            if (maxStreak > 0) {
              bestHabitName = maxHabit.name;
            }
          }

          setStats({
            bestStreak: maxStreak,
            avgCompletion: avgComp,
            bestStreakHabit: bestHabitName
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error?.message || 'Failed to fetch habits');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchHabits();
    
    return () => { isMounted = false; };
  }, [statusFilter]);

  // Filtering (client side search & frequency)
  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      if (frequencyFilter !== 'ALL' && h.frequencyType !== frequencyFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return h.name.toLowerCase().includes(query) || (h.description && h.description.toLowerCase().includes(query));
      }
      return true;
    });
  }, [habits, searchQuery, frequencyFilter]);

  // Derived Stats (Active only)
  const totalActive = statusFilter === 'ACTIVE' ? habits.length : 0;
  const completedToday = statusFilter === 'ACTIVE' ? habits.filter(h => h.isCheckedInToday).length : 0;

  // Handlers
  const handleCheckIn = async (id) => {
    try {
      const timezone = getBrowserTimezone();
      await habitApi.checkInHabit(id, timezone);
      setHabits(prev => prev.map(h => h.id === id ? { ...h, isCheckedInToday: true } : h));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to check in');
    }
  };

  const handleUndo = async (id) => {
    try {
      const timezone = getBrowserTimezone();
      await habitApi.undoCheckIn(id, timezone);
      setHabits(prev => prev.map(h => h.id === id ? { ...h, isCheckedInToday: false } : h));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to undo check in');
    }
  };

  const handleCreateOrEdit = async (payload, setModalError) => {
    try {
      if (editingHabit) {
        const updated = await habitApi.updateHabit(editingHabit.id, payload);
        // Retain check-in status from current state if available since update doesn't return it
        const current = habits.find(h => h.id === updated.id);
        if (current) updated.isCheckedInToday = current.isCheckedInToday;
        
        setHabits(prev => prev.map(h => h.id === updated.id ? updated : h));
      } else {
        const newHabit = await habitApi.createHabit(payload);
        newHabit.isCheckedInToday = false;
        
        // If we are looking at active, prepend it
        if (statusFilter === 'ACTIVE') {
          setHabits(prev => [newHabit, ...prev]);
        }
      }
      setIsFormOpen(false);
      setEditingHabit(null);
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to save habit');
    }
  };

  const handleRestore = async (id) => {
    try {
      await habitApi.restoreHabit(id);
      // Remove from archived view
      if (statusFilter === 'ARCHIVED') {
        setHabits(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to restore habit');
    }
  };

  const confirmAction = (type, habitId) => {
    setConfirmState({ isOpen: true, type, habitId });
  };

  const handleConfirmExecute = async () => {
    const { type, habitId } = confirmState;
    setConfirmState(prev => ({ ...prev, isExecuting: true }));
    
    try {
      if (type === 'ARCHIVE') {
        await habitApi.archiveHabit(habitId);
        if (statusFilter === 'ACTIVE') {
          setHabits(prev => prev.filter(h => h.id !== habitId));
        }
      } else if (type === 'DELETE') {
        await habitApi.deleteHabit(habitId);
        setHabits(prev => prev.filter(h => h.id !== habitId));
      }
      setConfirmState({ isOpen: false, type: null, habitId: null });
    } catch (err) {
      alert(err.response?.data?.error?.message || `Failed to ${type.toLowerCase()} habit`);
      setConfirmState(prev => ({ ...prev, isExecuting: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="rise" style={{ paddingBottom: '40px', minHeight: 'calc(100vh - 73px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 8px' }}>
              My Habits
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Manage your daily goals and routines.
            </p>
          </div>
          <button
            onClick={() => { setEditingHabit(null); setIsFormOpen(true); }}
            className="disp"
            style={{
              background: '#0e1116',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '16px' }}>+</span> Create Habit
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { label: 'Active Habits', value: totalActive, unit: '' },
            { label: 'Completed Today', value: completedToday, unit: `/${totalActive}` },
            { label: 'Best Streak', value: stats.bestStreak, unit: 'days', subtext: stats.bestStreakHabit },
            { label: 'Avg Completion', value: stats.avgCompletion, unit: '%' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(14,17,22,.06)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '12px' }}>{stat.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className="disp" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-.02em', color: '#0e1116' }}>{stat.value}</span>
                {stat.unit && <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{stat.unit}</span>}
              </div>
              {stat.subtext && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#3b6ef5', fontWeight: 600, background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', alignSelf: 'flex-start', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {stat.subtext}
                </div>
              )}
            </div>
          ))}
        </div>

        <HabitFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          frequencyFilter={frequencyFilter}
          setFrequencyFilter={setFrequencyFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,17,22,.06)', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading habits...</div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
              {error}
              <br/>
              <button onClick={() => setStatusFilter(statusFilter)} style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Retry</button>
            </div>
          ) : filteredHabits.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onCheckIn={handleCheckIn}
                  onUndo={handleUndo}
                  onEdit={(h) => { setEditingHabit(h); setIsFormOpen(true); }}
                  onArchive={(id) => confirmAction('ARCHIVE', id)}
                  onRestore={handleRestore}
                  onDelete={(id) => confirmAction('DELETE', id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={statusFilter === 'ARCHIVED' ? 'No archived habits' : 'No habits found'}
              description={searchQuery ? 'Try adjusting your search or filters.' : 'Create your first habit to start tracking your progress.'}
              actionText={!searchQuery && statusFilter === 'ACTIVE' ? 'Create Habit' : null}
              onAction={!searchQuery && statusFilter === 'ACTIVE' ? () => { setEditingHabit(null); setIsFormOpen(true); } : null}
              icon="🔍"
            />
          )}
        </div>

        <AppCredit />
      </div>

      <HabitFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingHabit(null); }}
        onSubmit={handleCreateOrEdit}
        initialData={editingHabit}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'DELETE' ? 'Delete Habit' : 'Archive Habit'}
        message={
          confirmState.type === 'DELETE' 
            ? 'Are you sure you want to permanently delete this habit? All associated history will be lost. This action cannot be undone.'
            : 'Are you sure you want to archive this habit? It will be hidden from your active list and you will no longer be able to check in.'
        }
        confirmText={confirmState.type === 'DELETE' ? 'Delete' : 'Archive'}
        isDanger={confirmState.type === 'DELETE'}
        onConfirm={handleConfirmExecute}
        onCancel={() => setConfirmState({ isOpen: false, type: null, habitId: null })}
        isExecuting={confirmState.isExecuting}
      />
    </DashboardLayout>
  );
};
