import api from './axios';

export const achievementApi = {
  getAchievements: async (timezone) => {
    const url = `/achievements?timezone=${encodeURIComponent(timezone)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getRecentAchievements: async (timezone, limit = 3) => {
    const url = `/achievements/recent?timezone=${encodeURIComponent(timezone)}&limit=${limit}`;
    const response = await api.get(url);
    return response.data.data;
  }
};
