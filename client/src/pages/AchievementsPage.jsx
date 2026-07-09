import { useState, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { EmptyState } from '../components/common/EmptyState';
import { achievementApi } from '../api/achievementApi';
import { getBrowserTimezone } from '../utils/timezone';
import { AppCredit } from '../components/common/AppCredit';

export const AchievementsPage = () => {
  const [filter, setFilter] = useState('ALL'); // ALL, UNLOCKED, LOCKED

  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const timezone = getBrowserTimezone();
      const res = await achievementApi.getAchievements(timezone);
      setAchievements(res.achievements);
      setSummary(res.summary);
      if (res.newlyUnlocked && res.newlyUnlocked.length > 0) {
        setNewlyUnlocked(res.newlyUnlocked);
        // We could show a toast here if we had a library, or just rely on the UI update.
      }
    } catch (err) {
      setError('Failed to load achievements.');
    } finally {
      setIsLoading(false);
    }
  };

  useMemo(() => {
    loadAchievements();
  }, []);

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      if (filter === 'UNLOCKED' && !a.isUnlocked) return false;
      if (filter === 'LOCKED' && a.isUnlocked) return false;
      return true;
    });
  }, [filter, achievements]);

  const total = summary?.total || 0;
  const unlocked = summary?.unlocked || 0;
  const percentage = summary?.completionPercentage || 0;
  
  const latestAchievement = summary?.latestAchievement ? summary.latestAchievement.name : 'None yet';

  return (
    <DashboardLayout>
      <div className="rise" style={{ paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 8px' }}>
              Achievements
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Unlock badges by building consistent habits over time.
            </p>
          </div>
        </div>

        {/* Summary Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { label: 'Achievements Unlocked', value: unlocked, unit: `/${total}` },
            { label: 'Completion', value: percentage, unit: '%' },
            { label: 'Latest Achievement', value: latestAchievement, unit: '', isText: true },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(14,17,22,.06)' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '12px' }}>{stat.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className="disp" style={{ 
                  fontSize: stat.isText ? '20px' : '32px', 
                  fontWeight: 600, 
                  letterSpacing: stat.isText ? '0' : '-.02em', 
                  color: '#0e1116',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {stat.value}
                </span>
                {stat.unit && <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{stat.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(14,17,22,.06)', paddingBottom: '16px' }}>
          {['ALL', 'UNLOCKED', 'LOCKED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#0e1116' : 'transparent',
                color: filter === f ? '#fff' : '#6b7280',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .2s'
              }}
            >
              {f === 'ALL' ? 'All Badges' : f === 'UNLOCKED' ? 'Unlocked' : 'Locked'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Loading your achievements...</div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#dc2626' }}>
            {error}
            <br />
            <button onClick={loadAchievements} style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Retry</button>
          </div>
        ) : (
          <>
            {newlyUnlocked.length > 0 && (
              <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
                🎉 Achievement unlocked: {newlyUnlocked.map(a => a.name).join(', ')}
              </div>
            )}
            {/* Grid */}
            {filteredAchievements.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {filteredAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No achievements found"
                description="Keep checking in on your habits to unlock new badges."
                icon="🏆"
              />
            )}
          </>
        )}

        <AppCredit />
      </div>
    </DashboardLayout>
  );
};
