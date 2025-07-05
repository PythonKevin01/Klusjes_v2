import { useState, useEffect, useCallback, useMemo } from "react";
import { Room, Task, TaskFormData } from "@/types";
import { storage, debounce, generateId, isOnline } from "./utils";
import { roomsApi, tasksApi } from "./api";

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

// Pending sync interface
interface PendingSync {
  rooms: Array<{ action: 'create' | 'update' | 'delete'; data: any }>;
  tasks: Array<{ action: 'create' | 'update' | 'delete'; data: any }>;
}

// Hook for managing rooms with API and localStorage fallback
export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Load rooms from API or localStorage
  useEffect(() => {
    const loadRooms = async (isInitial: boolean = false) => {
      try {
        if (isInitial) setLoading(true);
        if (!isInitial) setIsPolling(true);
        
        if (isOnline()) {
          const apiRooms = await roomsApi.getAll();
          setRooms(apiRooms);
          // Cache in localStorage for offline use
          storage.set("klusjes-rooms", apiRooms);
        } else {
          // Offline: load from localStorage
          const cachedRooms = storage.get("klusjes-rooms", []);
          setRooms(cachedRooms);
        }
      } catch (err) {
        console.error('API Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load rooms');
        // Fallback to localStorage on error
        const cachedRooms = storage.get("klusjes-rooms", []);
        setRooms(cachedRooms);
        
        // If no cached data, provide default rooms for testing
        if (cachedRooms.length === 0) {
          const defaultRooms = [
            { id: '1', name: 'Woonkamer', description: 'Gezellige ruimte', color: '#6366f1' },
            { id: '2', name: 'Keuken', description: 'Hart van het huis', color: '#10b981' },
            { id: '3', name: 'Slaapkamer', description: 'Rustige plek', color: '#8b5cf6' },
          ];
          setRooms(defaultRooms);
          storage.set("klusjes-rooms", defaultRooms);
        }
      } finally {
        if (isInitial) setLoading(false);
        if (!isInitial) setIsPolling(false);
      }
    };

    // Initial load
    loadRooms(true);
    
    // Smart polling - fast and battery-friendly fallback
    if (isOnline()) {
      let pollInterval: NodeJS.Timeout;
      
      const startPolling = () => {
        pollInterval = setInterval(() => {
          if (isOnline() && !isPolling && !document.hidden) {
            loadRooms(false);
          }
        }, 3000); // Check every 3 seconds
      };
      
      const stopPolling = () => {
        if (pollInterval) clearInterval(pollInterval);
      };
      
      // Start polling after a short delay to let initial load finish
      const timeoutId = setTimeout(() => {
        startPolling();
      }, 5000);
      
      // Pause polling when tab is hidden, resume when visible
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearTimeout(timeoutId);
        stopPolling();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  const addRoom = useCallback(async (name: string, description: string = "", color: string = "#6366f1") => {
    try {
      if (isOnline()) {
        const newRoom = await roomsApi.create({ name, description, color });
        setRooms(prev => [...prev, newRoom]);
        storage.set("klusjes-rooms", [...rooms, newRoom]);
        return newRoom;
      } else {
        // Offline: create locally
        const newRoom: Room = {
          id: generateId(),
          name,
          description,
          color,
        };
        setRooms(prev => [...prev, newRoom]);
        storage.set("klusjes-rooms", [...rooms, newRoom]);
        // Mark for sync when online
        const pendingSync: PendingSync = storage.get("pending-sync", { rooms: [], tasks: [] });
        pendingSync.rooms.push({ action: 'create', data: newRoom });
        storage.set("pending-sync", pendingSync);
        return newRoom;
      }
    } catch (err) {
      throw new Error('Failed to add room');
    }
  }, [rooms]);

  const updateRoom = useCallback(async (roomId: string, updates: Partial<Room>) => {
    try {
      if (isOnline()) {
        await roomsApi.update({ ...updates, id: roomId });
      }
      setRooms(prev => 
        prev.map(room => 
          room.id === roomId ? { ...room, ...updates } : room
        )
      );
      storage.set("klusjes-rooms", rooms.map(room => 
        room.id === roomId ? { ...room, ...updates } : room
      ));
    } catch (err) {
      throw new Error('Failed to update room');
    }
  }, [rooms]);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      if (isOnline()) {
        await roomsApi.delete(roomId);
      }
      setRooms(prev => prev.filter(room => room.id !== roomId));
      storage.set("klusjes-rooms", rooms.filter(room => room.id !== roomId));
    } catch (err) {
      throw new Error('Failed to delete room');
    }
  }, [rooms]);

  return {
    rooms,
    loading,
    error,
    addRoom,
    updateRoom,
    deleteRoom,
  };
}

// Hook for managing tasks with API and localStorage fallback
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Load tasks from API or localStorage
  useEffect(() => {
    const loadTasks = async (isInitial: boolean = false) => {
      try {
        if (isInitial) setLoading(true);
        if (!isInitial) setIsPolling(true);
        
        if (isOnline()) {
          const apiTasks = await tasksApi.getAll();
          setTasks(apiTasks);
          // Cache in localStorage for offline use
          storage.set("klusjes-tasks", apiTasks);
        } else {
          // Offline: load from localStorage
          const cachedTasks = storage.get("klusjes-tasks", []);
          setTasks(cachedTasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          })));
        }
      } catch (err) {
        console.error('Tasks API Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        // Fallback to localStorage on error
        const cachedTasks = storage.get("klusjes-tasks", []);
        const parsedTasks = cachedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
        setTasks(parsedTasks);
        
        // If no cached data, provide default tasks for testing
        if (cachedTasks.length === 0) {
          const defaultTasks = [
            {
              id: '1',
              title: 'Stofzuigen',
              description: 'Hele woonkamer stofzuigen',
              roomId: '1',
              priority: false,
              status: 'todo' as const,
              createdAt: new Date(),
              estimatedDuration: 30,
            },
            {
              id: '2',
              title: 'Afwas doen',
              description: 'Alle vuile vaat opruimen',
              roomId: '2',
              priority: true,
              status: 'in-progress' as const,
              createdAt: new Date(),
              estimatedDuration: 15,
            },
          ];
          setTasks(defaultTasks);
          storage.set("klusjes-tasks", defaultTasks);
        }
      } finally {
        if (isInitial) setLoading(false);
        if (!isInitial) setIsPolling(false);
      }
    };

    // Initial load
    loadTasks(true);
    
    // Smart polling - fast and battery-friendly fallback
    if (isOnline()) {
      let pollInterval: NodeJS.Timeout;
      
      const startPolling = () => {
        pollInterval = setInterval(() => {
          if (isOnline() && !isPolling && !document.hidden) {
            loadTasks(false);
          }
        }, 3000); // Check every 3 seconds
      };
      
      const stopPolling = () => {
        if (pollInterval) clearInterval(pollInterval);
      };
      
      // Start polling after a short delay to let initial load finish
      const timeoutId = setTimeout(() => {
        startPolling();
      }, 5000);
      
      // Pause polling when tab is hidden, resume when visible
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearTimeout(timeoutId);
        stopPolling();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  const addTask = useCallback(async (roomId: string, title: string, description: string, estimatedDuration: number, priority: boolean, dueDate?: string) => {
    try {
      const taskData: TaskFormData = {
        title,
        description,
        roomId,
        priority,
        estimatedDuration,
        dueDate,
        status: "todo",
      };

      if (isOnline()) {
        const newTask = await tasksApi.create(taskData);
        setTasks(prev => [...prev, newTask]);
        storage.set("klusjes-tasks", [...tasks, newTask]);
        return newTask;
      } else {
        // Offline: create locally
        const newTask: Task = {
          id: generateId(),
          ...taskData,
          status: "todo",
          createdAt: new Date(),
          dueDate: dueDate ? new Date(dueDate) : undefined,
        };
        setTasks(prev => [...prev, newTask]);
        storage.set("klusjes-tasks", [...tasks, newTask]);
        // Mark for sync when online
        const pendingSync: PendingSync = storage.get("pending-sync", { rooms: [], tasks: [] });
        pendingSync.tasks.push({ action: 'create', data: newTask });
        storage.set("pending-sync", pendingSync);
        return newTask;
      }
    } catch (err) {
      throw new Error('Failed to add task');
    }
  }, [tasks]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    try {
      if (isOnline()) {
        await tasksApi.update(updatedTask);
      }
      setTasks(prev => 
        prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      storage.set("klusjes-tasks", tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      throw new Error('Failed to update task');
    }
  }, [tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      if (isOnline()) {
        await tasksApi.delete(taskId);
      }
      setTasks(prev => prev.filter(task => task.id !== taskId));
      storage.set("klusjes-tasks", tasks.filter(task => task.id !== taskId));
    } catch (err) {
      throw new Error('Failed to delete task');
    }
  }, [tasks]);

  const progressTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const statusOrder = ["todo", "in-progress", "waiting", "completed"] as const;
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    const updatedTask = {
      ...task,
      status: nextStatus,
      completedAt: nextStatus === "completed" ? new Date() : undefined,
    };

    await updateTask(updatedTask);
  }, [tasks, updateTask]);

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
    loading,
    error,
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