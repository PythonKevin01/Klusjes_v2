import { Room, Task, TaskFormData, TaskPhoto } from "@/types";

const API_BASE = "/api";

// Helper for handling responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Room endpoints
export const roomsApi = {
  async getAll(): Promise<Room[]> {
    const response = await fetch(`${API_BASE}/rooms.php`);
    return handleResponse<Room[]>(response);
  },

  async create(room: { name: string; description: string; color: string }): Promise<Room> {
    const response = await fetch(`${API_BASE}/rooms.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    return handleResponse<Room>(response);
  },

  async update(room: Partial<Room> & { id: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/rooms.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    await handleResponse(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/rooms.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await handleResponse(response);
  },
};

// Task endpoints
export const tasksApi = {
  async getAll(roomId?: string): Promise<Task[]> {
    const url = roomId 
      ? `${API_BASE}/tasks.php?room_id=${roomId}`
      : `${API_BASE}/tasks.php`;
    const response = await fetch(url);
    const tasks = await handleResponse<any[]>(response);
    
    // Convert date strings to Date objects
    return tasks.map(task => ({
      ...task,
      roomId: task.room_id,
      createdAt: new Date(task.created_at),
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      photos: task.photos?.map((photo: any) => ({
        ...photo,
        createdAt: photo.created_at ? new Date(photo.created_at) : undefined,
      })) || [],
    }));
  },

  async create(task: TaskFormData): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const created = await handleResponse<any>(response);
    
    return {
      ...created,
      roomId: created.room_id,
      createdAt: new Date(created.created_at),
      dueDate: created.due_date ? new Date(created.due_date) : undefined,
      photos: created.photos || [],
    };
  },

  async update(task: Partial<Task> & { id: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...task,
        roomId: task.roomId,
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      }),
    });
    await handleResponse(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await handleResponse(response);
  },
};

// Photo endpoints
export const photosApi = {
  async delete(photoId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/photos.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photoId }),
    });
    await handleResponse(response);
  },

  async getForTask(taskId: string): Promise<TaskPhoto[]> {
    const response = await fetch(`${API_BASE}/photos.php?task_id=${taskId}`);
    const photos = await handleResponse<any[]>(response);
    
    return photos.map(photo => ({
      ...photo,
      createdAt: photo.created_at ? new Date(photo.created_at) : undefined,
    }));
  },
};

// Photo upload
export async function uploadPhoto(file: File, taskId: string): Promise<{ id: string; url: string; size: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('taskId', taskId);

  const response = await fetch(`${API_BASE}/upload.php`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
} 