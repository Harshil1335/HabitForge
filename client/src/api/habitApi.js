import api from './axios';

export const habitApi = {
  getHabits: async (status, timezone) => {
    let url = '/habits';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (timezone) params.append('timezone', timezone);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data.data.habits;
  },

  getHabit: async (id) => {
    const response = await api.get(`/habits/${id}`);
    return response.data.data.habit;
  },

  createHabit: async (data) => {
    const response = await api.post('/habits', data);
    return response.data.data.habit;
  },

  updateHabit: async (id, data) => {
    const response = await api.put(`/habits/${id}`, data);
    return response.data.data.habit;
  },

  archiveHabit: async (id) => {
    const response = await api.patch(`/habits/${id}/archive`);
    return response.data.data.habit;
  },

  restoreHabit: async (id) => {
    const response = await api.patch(`/habits/${id}/restore`);
    return response.data.data.habit;
  },

  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data.data;
  },

  checkInHabit: async (id, timezone) => {
    const response = await api.post(`/habits/${id}/checkin`, { timezone });
    return response.data.data.checkIn;
  },

  undoCheckIn: async (id, timezone) => {
    const response = await api.delete(`/habits/${id}/checkin`, { data: { timezone } });
    return response.data.data;
  },
};
