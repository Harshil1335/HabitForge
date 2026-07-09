import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ContributionGraph } from '../components/dashboard/ContributionGraph';
import { AppCredit } from '../components/common/AppCredit';
import { analyticsApi } from '../api/analyticsApi';
import { getBrowserTimezone } from '../utils/timezone';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [sortOption, setSortOption] = useState('highestCompletion');
  
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [insights, setInsights] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [habitPerformance, setHabitPerformance] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const timezone = getBrowserTimezone();
      
      const [sumRes, trendRes, insRes, habRes] = await Promise.all([
        analyticsApi.getSummary(timezone, timeRange),
        analyticsApi.getTrend(timezone, timeRange),
        analyticsApi.getInsights(timezone, timeRange),
        analyticsApi.getHabitPerformance(timezone, timeRange, sortOption)
      ]);

      setSummary(sumRes.summary);
      setTrend(trendRes);
      setInsights(insRes.insights);
      setHabitPerformance(habRes.habits);
      
      // Load contributions only if not loaded yet
      if (contributions.length === 0) {
        const contRes = await analyticsApi.getContributions(timezone);
        setContributions(contRes.contributions);
      }
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, sortOption]);

  return (
    <DashboardLayout>
      <div className="rise" style={{ paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 8px' }}>
              Analytics
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Track your progress and discover trends.
            </p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '10px 32px 10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(14,17,22,.1)',
                fontSize: '13.5px',
                background: '#fff',
                fontWeight: 600,
                color: '#0e1116',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230e1116' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '20px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
            <button onClick={loadAnalytics} style={{ marginLeft: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {isLoading && !summary && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Loading analytics...</div>
        )}

        {(!isLoading || summary) && (
          <>
            {/* Summary Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {[
                { label: 'Completion rate', value: summary?.completionRate || 0, unit: '%' },
                { label: 'Current streak', value: summary?.currentStreak || 0, unit: 'days', subtext: summary?.currentStreakHabit },
                { label: 'Best streak', value: summary?.bestStreak || 0, unit: 'days', subtext: summary?.bestStreakHabit },
                { label: 'Total check-ins', value: summary?.totalCheckIns || 0, unit: '' },
              ].map((stat, i) => (
                <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(14,17,22,.06)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '12px' }}>{stat.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span className="disp" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-.02em', color: '#0e1116' }}>{stat.value}</span>
                    {stat.unit && <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{stat.unit}</span>}
                  </div>
                  {stat.subtext && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#3b6ef5', fontWeight: 600, background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', alignSelf: 'flex-start', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                      {stat.subtext}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CSS Trend Chart & Insights */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '40px' }}>
              
              <div style={{ flex: '1 1 600px', background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid rgba(14,17,22,.06)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px', letterSpacing: '-.01em' }}>Completion Trend</h2>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', paddingBottom: '30px', position: 'relative', overflowX: 'auto' }}>
                  {trend?.points?.map((d, i) => (
                    <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minWidth: '24px', position: 'relative' }}>
                      <div 
                        title={`${d.completionRate}%`}
                        style={{ 
                          width: '100%', 
                          height: `${d.completionRate}%`, 
                          background: '#3b6ef5', 
                          borderRadius: '4px 4px 0 0',
                          minHeight: '4px',
                          transition: 'height .3s ease'
                        }} 
                      />
                      <div style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: '#9aa0ab', whiteSpace: 'nowrap' }}>
                        {d.label}
                      </div>
                    </div>
                  ))}
                  {(!trend?.points || trend.points.length === 0) && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#6b7280' }}>
                      No trend data available.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ flex: '1 1 300px', background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid rgba(14,17,22,.06)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px', letterSpacing: '-.01em' }}>Insights</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {insights.map((insight, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#0e1116', marginBottom: '2px' }}>{insight.title}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{insight.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap Section */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid rgba(14,17,22,.06)', marginBottom: '40px' }}>
              <ContributionGraph contributions={contributions} totalCheckIns={summary?.totalCheckIns} />
            </div>

            {/* Habit Performance List */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,17,22,.06)' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(14,17,22,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, letterSpacing: '-.01em' }}>Habit Performance</h2>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    padding: '8px 28px 8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(14,17,22,.1)',
                    fontSize: '13px',
                    background: '#fff',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                  }}
                >
                  <option value="highestCompletion">Highest Completion</option>
                  <option value="lowestCompletion">Lowest Completion</option>
                  <option value="longestStreak">Longest Streak</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {habitPerformance.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    No active habits during this period.
                  </div>
                ) : (
                  habitPerformance.map(h => (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 32px', borderBottom: '1px solid rgba(14,17,22,.06)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: h.color + '1a', color: h.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flex: 'none' }}>
                        {h.icon || '🎯'}
                      </div>
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#0e1116', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Streak: {h.currentStreak}d</div>
                      </div>
                      <div style={{ flex: '2 1 300px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${h.completionRate}%`, background: h.color, borderRadius: '4px' }} />
                        </div>
                        <div style={{ width: '48px', textAlign: 'right', fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                          {h.completionRate}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
        
        <AppCredit />
      </div>
    </DashboardLayout>
  );
};
