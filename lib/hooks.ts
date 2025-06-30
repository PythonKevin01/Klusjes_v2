import { useState, useEffect, useCallback, useMemo } from "react";
import { Room, Task, TaskFormData } from "@/types";
import { storage, debounce, generateId } from "./utils";

// Mock initial data
export const initialRooms: Room[] = [
  {
    id: "1",
    name: "Woonkamer",
    description: "Gezellige ruimte om te ontspannen",
    color: "#6366f1",
  },
  {
    id: "2", 
    name: "Keuken",
    description: "Hart van het huis",
    color: "#10b981",
  },
  {
    id: "3",
    name: "Slaapkamer",
    description: "Rustige plek om uit te rusten",
    color: "#8b5cf6",
  },
  {
    id: "4",
    name: "Badkamer",
    description: "Voor persoonlijke verzorging",
    color: "#f59e0b",
  },
  {
    id: "5",
    name: "Kantoor",
    description: "Productieve werkruimte",
    color: "#ef4444",
  },
  {
    id: "6",
    name: "Tuin",
    description: "Groene buitenruimte",
    color: "#22c55e",
  },
];

export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Stofzuigen",
    description: "Hele woonkamer stofzuigen, ook onder de bank",
    roomId: "1",
    priority: false,
    status: "todo",
    createdAt: new Date(),
    estimatedDuration: 30,
  },
  {
    id: "2",
    title: "Afwas doen",
    description: "Alle vuile vaat opruimen",
    roomId: "2",
    priority: true,
    status: "in-progress",
    createdAt: new Date(),
    estimatedDuration: 15,
  },
  {
    id: "3",
    title: "Bed opmaken",
    roomId: "3",
    priority: false,
    status: "completed",
    createdAt: new Date(),
    completedAt: new Date(),
    estimatedDuration: 5,
  },
];

// Hook for managing rooms with localStorage persistence
export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>(() => 
    storage.get("klusjes-rooms", initialRooms)
  );

  // Debounced save to localStorage
  const saveToStorage = useMemo(
    () => debounce((rooms: Room[]) => storage.set("klusjes-rooms", rooms), 500),
    []
  );

  useEffect(() => {
    saveToStorage(rooms);
  }, [rooms, saveToStorage]);

  const addRoom = useCallback((roomData: { name: string; color: string; description?: string }) => {
    const newRoom: Room = {
      id: generateId(),
      ...roomData,
    };
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  }, []);

  const updateRoom = useCallback((roomId: string, updates: Partial<Room>) => {
    setRooms(prev => 
      prev.map(room => 
        room.id === roomId ? { ...room, ...updates } : room
      )
    );
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
  }, []);

  return {
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
  };
}

// Hook for managing tasks with localStorage persistence
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = storage.get("klusjes-tasks", initialTasks);
    // Convert date strings back to Date objects
    return stored.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }));
  });

  // Debounced save to localStorage
  const saveToStorage = useMemo(
    () => debounce((tasks: Task[]) => storage.set("klusjes-tasks", tasks), 500),
    []
  );

  useEffect(() => {
    saveToStorage(tasks);
  }, [tasks, saveToStorage]);

  const addTask = useCallback((taskData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      roomId: taskData.roomId,
      priority: taskData.priority,
      status: taskData.status || "todo",
      createdAt: new Date(),
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      estimatedDuration: taskData.estimatedDuration,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<TaskFormData>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? {
              ...task,
              ...updates,
              dueDate: updates.dueDate ? new Date(updates.dueDate) : task.dueDate,
            }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const progressTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "todo" ? "in-progress" : 
                     task.status === "in-progress" ? "waiting" :
                     task.status === "waiting" ? "completed" : "todo" as Task["status"],
              completedAt: task.status === "waiting" ? new Date() : undefined,
            }
          : task
      )
    );
  }, []);

  // Memoized computed values
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const waiting = tasks.filter(t => t.status === "waiting").length;
    const priority = tasks.filter(t => t.priority && t.status !== "completed").length;
    const todo = tasks.filter(t => t.status === "todo").length;

    return {
      total,
      completed,
      inProgress,
      waiting,
      priority,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const getTasksForRoom = useCallback((roomId: string) => {
    return tasks.filter(task => task.roomId === roomId);
  }, [tasks]);

  return {
    tasks,
    taskStats,
    addTask,
    updateTask,
    deleteTask,
    progressTask,
    getTasksForRoom,
  };
}

// Hook for managing UI state
export function useUIState() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openTaskForm = useCallback((roomId?: string) => {
    setSelectedRoomId(roomId);
    setShowTaskForm(true);
  }, []);

  const closeTaskForm = useCallback(() => {
    setShowTaskForm(false);
    setSelectedRoomId(undefined);
  }, []);

  const openRoomForm = useCallback(() => {
    setShowRoomForm(true);
  }, []);

  const closeRoomForm = useCallback(() => {
    setShowRoomForm(false);
  }, []);

  const editTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const closeTaskEditor = useCallback(() => {
    setEditingTask(null);
  }, []);

  return {
    showTaskForm,
    showRoomForm,
    selectedRoomId,
    editingTask,
    openTaskForm,
    closeTaskForm,
    openRoomForm,
    closeRoomForm,
    editTask,
    closeTaskEditor,
  };
} 