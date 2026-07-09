import api from './axios';

export const analyticsApi = {
  getSummary: async (timezone, range) => {
    let url = `/analytics/summary?timezone=${encodeURIComponent(timezone)}`;
    if (range) url += `&range=${encodeURIComponent(range)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getContributions: async (timezone, year) => {
    let url = `/analytics/contributions?timezone=${encodeURIComponent(timezone)}`;
    if (year) url += `&year=${encodeURIComponent(year)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getWeeklyOverview: async (timezone) => {
    const url = `/analytics/weekly?timezone=${encodeURIComponent(timezone)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getHabitPerformance: async (timezone, range, sort) => {
    let url = `/analytics/habits?timezone=${encodeURIComponent(timezone)}`;
    if (range) url += `&range=${encodeURIComponent(range)}`;
    if (sort) url += `&sort=${encodeURIComponent(sort)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getDashboardAnalytics: async (timezone) => {
    const url = `/analytics/dashboard?timezone=${encodeURIComponent(timezone)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getTrend: async (timezone, range) => {
    let url = `/analytics/trend?timezone=${encodeURIComponent(timezone)}`;
    if (range) url += `&range=${encodeURIComponent(range)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getInsights: async (timezone, range) => {
    let url = `/analytics/insights?timezone=${encodeURIComponent(timezone)}`;
    if (range) url += `&range=${encodeURIComponent(range)}`;
    const response = await api.get(url);
    return response.data.data;
  },
};
