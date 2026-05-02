const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = localStorage.getItem('fittrack_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('fittrack_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('fittrack_token');
  }

  private headers() {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  private async fetch(method: string, path: string, body?: any) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  get(path: string) { return this.fetch('GET', path); }
  post(path: string, body: any) { return this.fetch('POST', path, body); }
  put(path: string, body: any) { return this.fetch('PUT', path, body); }
  delete(path: string) { return this.fetch('DELETE', path); }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.post('/auth/register', { email, password, name });
  }

  async login(email: string, password: string) {
    const data = await this.post('/auth/login', { email, password });
    if (data.token) this.setToken(data.token);
    return data;
  }

  logout() {
    this.clearToken();
  }

  isLoggedIn() {
    return !!this.token;
  }

  // Meals
  getMeals(date?: string) {
    return this.get(`/meals${date ? `?date=${date}` : ''}`);
  }
  createMeal(meal: any) {
    return this.post('/meals', meal);
  }
  deleteMeal(id: string) {
    return this.delete(`/meals/${id}`);
  }

  // Workouts
  getWorkouts(date?: string) {
    return this.get(`/workouts${date ? `?date=${date}` : ''}`);
  }
  createWorkout(workout: any) {
    return this.post('/workouts', workout);
  }
  deleteWorkout(id: string) {
    return this.delete(`/workouts/${id}`);
  }

  // Weight
  getWeightLogs() {
    return this.get('/weight');
  }
  createWeightLog(log: any) {
    return this.post('/weight', log);
  }
  deleteWeightLog(id: string) {
    return this.delete(`/weight/${id}`);
  }

  // Health
  getHealthData(date?: string) {
    return this.get(`/health${date ? `?date=${date}` : ''}`);
  }
  createHealthData(data: any) {
    return this.post('/health', data);
  }
  importHealthData(data: any[]) {
    return this.post('/health/import', { data });
  }

  // Profile
  getProfile() {
    return this.get('/profile');
  }
  updateProfile(data: any) {
    return this.put('/profile', data);
  }
}

export const api = new ApiClient();
