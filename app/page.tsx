"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RoomCard } from "@/components/room-card";
import { RoomForm } from "@/components/room-form";
import { TaskForm } from "@/components/task-form";
import { TaskEditor } from "@/components/task-editor";
import { useRooms } from "@/lib/hooks";
import { useTasks } from "@/lib/hooks";
import { useUIState } from "@/lib/hooks";
import { useToast } from "@/components/ui/toast";
import { Task } from "@/types";
import { Plus, Settings } from "lucide-react";

export default function HomePage() {
  const [isClient, setIsClient] = React.useState(false);
  const { rooms, addRoom, updateRoom, deleteRoom } = useRooms();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { 
    isRoomFormOpen, 
    isTaskFormOpen, 
    selectedTask, 
    selectedRoomId,
    openRoomForm,
    closeRoomForm,
    openTaskForm,
    closeTaskForm,
    openTaskEditor,
    closeTaskEditor
  } = useUIState();
  const { showToast } = useToast();

  // Ensure client-side hydration
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized handlers
  const handleRoomSubmit = React.useCallback(async (data: { name: string; description: string }) => {
    try {
      await addRoom(data.name, data.description);
      closeRoomForm();
      showToast("Kamer succesvol toegevoegd! 🏠", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het toevoegen van de kamer", "error");
      console.error("Failed to add room:", error);
    }
  }, [addRoom, closeRoomForm, showToast]);

  const handleTaskSubmit = React.useCallback(async (data: {
    title: string;
    description: string;
    estimatedDuration: number;
    priority: boolean;
  }) => {
    try {
      if (!selectedRoomId) {
        showToast("Geen kamer geselecteerd", "error");
        return;
      }
      
      await addTask(selectedRoomId, data.title, data.description, data.estimatedDuration, data.priority);
      closeTaskForm();
      showToast("Klusje succesvol toegevoegd! ✅", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het toevoegen van het klusje", "error");
      console.error("Failed to add task:", error);
    }
  }, [selectedRoomId, addTask, closeTaskForm, showToast]);

  const handleTaskUpdate = React.useCallback(async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask);
      closeTaskEditor();
      showToast("Klusje succesvol bijgewerkt! 📝", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het bijwerken van het klusje", "error");
      console.error("Failed to update task:", error);
    }
  }, [updateTask, closeTaskEditor, showToast]);

  const handleTaskDelete = React.useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      showToast("Klusje verwijderd 🗑️", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het verwijderen van het klusje", "error");
      console.error("Failed to delete task:", error);
    }
  }, [deleteTask, showToast]);

  const handleTaskProgress = React.useCallback(async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const statusOrder = ["todo", "in-progress", "waiting", "completed"] as const;
      const currentIndex = statusOrder.indexOf(task.status);
      const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

      await updateTask({ ...task, status: nextStatus });
      
      const statusMessages = {
        "todo": "Klusje teruggezet naar te doen ↩️",
        "in-progress": "Klusje gestart! 🚀", 
        "waiting": "Klusje op wacht gezet ⏸️",
        "completed": "Klusje voltooid! 🎉"
      };
      
      showToast(statusMessages[nextStatus], "success");
    } catch (error) {
      showToast("Er ging iets mis bij het bijwerken van de status", "error");
      console.error("Failed to update task status:", error);
    }
  }, [tasks, updateTask, showToast]);

  const handleAddTask = React.useCallback((roomId: string) => {
    openTaskForm(roomId);
  }, [openTaskForm]);

  const handleTaskClick = React.useCallback((task: Task) => {
    openTaskEditor(task);
  }, [openTaskEditor]);

  // Memoized room cards
  const roomCards = React.useMemo(() => {
    return rooms.map((room) => {
      const roomTasks = tasks.filter(task => task.roomId === room.id);
      
      return (
        <RoomCard
          key={room.id}
          room={room}
          tasks={roomTasks}
          onAddTask={handleAddTask}
          onTaskClick={handleTaskClick}
          onTaskDelete={handleTaskDelete}
          onTaskProgress={handleTaskProgress}
        />
      );
    });
  }, [rooms, tasks, handleAddTask, handleTaskClick, handleTaskDelete, handleTaskProgress]);

  // Calculate statistics only on client side
  const stats = React.useMemo(() => {
    if (!isClient) {
      return { totalTasks: 0, completedTasks: 0, completionPercentage: 0 };
    }
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, completedTasks, completionPercentage };
  }, [tasks, isClient]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Only title and theme toggle */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left side - Title */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Kamers & Klusjes
            </h1>
          </div>

          
          {/* Right side - Only theme toggle */}
          <div className="flex-1 flex items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">

        {/* Completion percentage above rooms */}
          {isClient && stats.totalTasks > 0 && (
            <div className="mb-4 text-center">
              <div className="text-lg font-medium text-muted-foreground">
                <span className="font-bold text-foreground">{stats.completionPercentage}%</span> voltooid
              </div>
            </div>
          )}

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto max-w-sm">
              <div className="mb-4">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nog geen kamers
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Voeg je eerste kamer toe om klusjes te organiseren
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roomCards}
          </div>
        )}
      
        {/* Forms */}
        <RoomForm
          isOpen={isRoomFormOpen}
          onClose={closeRoomForm}
          onSubmit={handleRoomSubmit}
        />

        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={closeTaskForm}
          onSubmit={handleTaskSubmit}
        />

        {selectedTask && (
          <TaskEditor
            task={selectedTask}
            onSave={handleTaskUpdate}
            onClose={closeTaskEditor}
          />
        )}
           {/* Stats Summary - Show after + Kamer button */}
           {isClient && stats.totalTasks > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">Totaal klusjes</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">Voltooid</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTasks - stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">Te doen</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold text-purple-600">{stats.completionPercentage}%</div>
              <p className="text-xs text-muted-foreground">Voortgang</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
} 