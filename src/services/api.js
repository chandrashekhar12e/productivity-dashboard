import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchMetrics = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await axios.get(`${API_URL}/api/metrics`, { params });
  return response.data;
};

export const generateDummyData = async (count = 200, hoursAgo = 8) => {
  const response = await axios.post(`${API_URL}/api/seed/dummy-events`, {
    count,
    hoursAgo
  });
  return response.data;
};