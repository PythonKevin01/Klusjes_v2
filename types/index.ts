export interface Room {
  id: string;
  name: string;
  description?: string;
  color: string;
  iconName?: string;
}

export interface TaskPhoto {
  id: string;
  url: string;
  createdAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  roomId: string;
  priority: boolean;
  status: "todo" | "in-progress" | "waiting" | "completed";
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  estimatedDuration?: number; // in minutes
  photos?: TaskPhoto[];
}

export interface TaskFormData {
  title: string;
  description: string;
  roomId: string;
  priority: boolean;
  status?: Task["status"];
  dueDate?: string;
  estimatedDuration?: number;
} 