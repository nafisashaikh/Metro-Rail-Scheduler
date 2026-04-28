import { apiUrl } from '../config/api';

export interface Task {
  id: string;
  title: string;
  station: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  time: string;
}

const AUTH_TOKEN_KEY = 'mrs_auth_token';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(apiUrl('/tasks'), {
    headers: { ...getAuthHeaders() }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks (${response.status})`);
  }
  
  const data = await response.json();
  return Array.isArray(data.tasks) ? data.tasks : [];
}

export async function createTask(input: Omit<Task, 'id'>): Promise<Task> {
  const response = await fetch(apiUrl('/tasks'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(input)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create task (${response.status})`);
  }
  
  const data = await response.json();
  return data.task;
}

export async function toggleTaskStatus(id: string, currentStatus: Task['status']): Promise<Task> {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  const response = await fetch(apiUrl(`/tasks/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status: newStatus })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update task (${response.status})`);
  }
  
  const data = await response.json();
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/tasks/${id}`), {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete task (${response.status})`);
  }
}
