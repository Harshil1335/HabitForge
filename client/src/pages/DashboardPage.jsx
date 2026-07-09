import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { HeroSection } from '../components/dashboard/HeroSection';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { ContributionGraph } from '../components/dashboard/ContributionGraph';
import { TodayHabits } from '../components/dashboard/TodayHabits';
import { WeeklyOverview } from '../components/dashboard/WeeklyOverview';
import { TopStreaks } from '../components/dashboard/TopStreaks';
import { RecentBadges } from '../components/dashboard/RecentBadges';
import { AppCredit } from '../components/common/AppCredit';
import { habitApi } from '../api/habitApi';
import { analyticsApi } from '../api/analyticsApi';
import { achievementApi } from '../api/achievementApi';
import { getBrowserTimezone } from '../utils/timezone';
import { isScheduledToday } from '../utils/schedule';

export const DashboardPage = () => {
  // Real state for Today's Habits
  const [realHabits, setRealHabits] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recentBadges, setRecentBadges] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const timezone = getBrowserTimezone();
      
      const [habitsData, analyticsRes, badgesRes] = await Promise.all([
        habitApi.getHabits('active', timezone),
        analyticsApi.getDashboardAnalytics(timezone),
        achievementApi.getRecentAchievements(timezone, 3)
      ]);
      
      const scheduledForToday = habitsData.filter(h => isScheduledToday(h, timezone));
      setRealHabits(scheduledForToday);
      setAnalyticsData(analyticsRes);
      setRecentBadges(badgesRes?.achievements || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Real toggle handler
  const toggleRealHabit = async (id) => {
    const habit = realHabits.find(h => h.id === id);
    if (!habit) return;

    try {
      const timezone = getBrowserTimezone();
      if (habit.isCheckedInToday) {
        await habitApi.undoCheckIn(id, timezone);
        setRealHabits(prev => prev.map(h => h.id === id ? { ...h, isCheckedInToday: false } : h));
      } else {
        await habitApi.checkInHabit(id, timezone);
        setRealHabits(prev => prev.map(h => h.id === id ? { ...h, isCheckedInToday: true } : h));
      }
      // Re-fetch analytics to keep them in sync
      const analyticsRes = await analyticsApi.getDashboardAnalytics(timezone);
      setAnalyticsData(analyticsRes);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update check-in');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 73px)' }}>
        <HeroSection habits={realHabits} />
        
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Loading your dashboard...</div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#dc2626' }}>
            {error}
            <br />
            <button onClick={loadDashboard} style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Retry</button>
          </div>
        ) : (
          <>
            <StatsGrid summary={analyticsData?.summary} />
            <ContributionGraph contributions={analyticsData?.contributions} totalCheckIns={analyticsData?.summary?.totalCheckIns} />

            {/* Two column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '40px', alignItems: 'start', paddingBottom: '40px' }}>
              <div>
                <TodayHabits habits={realHabits} toggleHabit={toggleRealHabit} />
              </div>
              
              <div className="rise" style={{ display: 'flex', flexDirection: 'column', gap: '34px' }}>
                <div>
                  <h2 style={{ margin: '0 0 18px', fontSize: '20px', fontWeight: 600, letterSpacing: '-.02em' }}>
                    This week
                  </h2>
                  <WeeklyOverview 
                    progressPct={
                      analyticsData?.weekly?.days?.reduce((sum, d) => sum + d.completed, 0) / 
                      (analyticsData?.weekly?.days?.reduce((sum, d) => sum + d.scheduled, 0) || 1) * 100 
                      | 0 // simple Math.floor
                    } 
                    weeklyData={analyticsData?.weekly} 
                  />
                </div>
                <TopStreaks streaks={analyticsData?.topStreaks} />
                <RecentBadges badges={recentBadges} />
              </div>
            </div>
          </>
        )}
        
        <AppCredit />
      </div>
    </DashboardLayout>
  );
};
