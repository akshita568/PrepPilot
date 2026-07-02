import axios from 'axios';

// Create a configured instance pointing to your Docker backend container port
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically injects the JWT token if it exists in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized authentication endpoints
export const authService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// Centralized task manager endpoints (Character-matched with backend decorators)
export const taskService = {
  getTasks: async () => {
    const response = await api.get('/tasks'); // <-- REMOVED trailing slash "/"
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData); // <-- REMOVED trailing slash "/"
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`); 
    return response.data;
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    return true;
  },

  // AI ROUTE ENGINES
  generateAISchedule: async (rawPlanText, startDate) => {
    const response = await api.post('/tasks/generate-ai-schedule', {
      raw_plan_text: rawPlanText,
      start_date: startDate
    });
    return response.data;
  },

  getAISuggestions: async (taskTitle) => {
    const response = await api.post('/tasks/suggest-subtasks', {
      task_title: taskTitle
    });
    return response.data;
  }
};