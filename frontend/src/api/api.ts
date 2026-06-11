const BASE_URL = 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('wfh_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data as T;
}

export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: {
    username: string;
    password: string;
    fullName: string;
    role?: string;
  }) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/api/auth/me'),
};

export const attendanceApi = {
  clockIn: (formData: FormData) =>
    request<AttendanceRecord>('/api/attendance/clock-in', {
      method: 'POST',
      body: formData,
    }),

  clockOut: (formData: FormData) =>
    request<AttendanceRecord>('/api/attendance/clock-out', {
      method: 'POST',
      body: formData,
    }),

  getToday: () => request<AttendanceRecord | null>('/api/attendance/today'),

  getHistory: () => request<AttendanceRecord[]>('/api/attendance/history'),

  getAllAttendances: () =>
    request<AttendanceWithUser[]>('/api/attendance/admin/all'),

  deleteAttendance: (id: number) =>
    request(`/api/attendance/admin/${id}`, { method: 'DELETE' }),

  deleteAllAttendances: () =>
    request('/api/attendance/admin/all', { method: 'DELETE' }),
};

export const employeeApi = {
  getAll: () => request<User[]>('/api/employees'),

  create: (data: {
    username: string;
    password: string;
    fullName: string;
    role?: string;
  }) =>
    request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: {
      fullName?: string;
      username?: string;
      password?: string;
      role?: string;
    },
  ) =>
    request(`/api/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request(`/api/employees/${id}`, { method: 'DELETE' }),
};

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'employee' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  clockInPhoto: string;
  clockOutPhoto?: string;
  status: string;
  createdAt: string;
}

export interface AttendanceWithUser extends AttendanceRecord {
  fullName: string;
  username: string;
}

export { BASE_URL };
