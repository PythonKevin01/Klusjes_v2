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
import { DebugPanel } from "@/components/debug-panel";

export default function HomePage() {
  const [isClient, setIsClient] = React.useState(false);
  const { rooms, loading: roomsLoading, error: roomsError, addRoom, updateRoom, deleteRoom } = useRooms();
  const { tasks, loading: tasksLoading, error: tasksError, addTask, updateTask, deleteTask } = useTasks();
  const { 
    showRoomForm: isRoomFormOpen, 
    showTaskForm: isTaskFormOpen, 
    editingTask: selectedTask, 
    selectedRoomId,
    openRoomForm,
    closeRoomForm,
    openTaskForm,
    closeTaskForm,
    editTask: openTaskEditor,
    closeTaskEditor
  } = useUIState();
  const { showToast } = useToast();

  // Ensure client-side hydration
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized handlers
  const handleRoomSubmit = React.useCallback(async (data: { name: string; description: string; color: string }) => {
    try {
      await addRoom(data.name, data.description);
      closeRoomForm();
      showToast("Kamer succesvol toegevoegd! 🏠", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het toevoegen van de kamer", "destructive");
      console.error("Failed to add room:", error);
    }
  }, [addRoom, closeRoomForm, showToast]);

  const handleTaskSubmit = React.useCallback(async (data: {
    title: string;
    description: string;
    estimatedDuration: number;
    priority: boolean;
    roomId: string;
    dueDate?: string;
  }) => {
    try {
      const roomIdToUse = data.roomId || selectedRoomId;
      if (!roomIdToUse) {
        showToast("Geen kamer geselecteerd", "destructive");
        return;
      }
      await addTask(roomIdToUse, data.title, data.description, data.estimatedDuration, data.priority, data.dueDate);
      closeTaskForm();
      showToast("Klusje succesvol toegevoegd! ✅", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het toevoegen van het klusje", "destructive");
      console.error("Failed to add task:", error);
    }
  }, [selectedRoomId, addTask, closeTaskForm, showToast]);

  const handleTaskUpdate = React.useCallback(async (taskId: string, data: any) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updatedTask = { ...task, ...data };
      await updateTask(updatedTask);
      closeTaskEditor();
      showToast("Klusje succesvol bijgewerkt! 📝", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het bijwerken van het klusje", "destructive");
      console.error("Failed to update task:", error);
    }
  }, [tasks, updateTask, closeTaskEditor, showToast]);

  const handleTaskDelete = React.useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      showToast("Klusje verwijderd 🗑️", "success");
    } catch (error) {
      showToast("Er ging iets mis bij het verwijderen van het klusje", "destructive");
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
      showToast("Er ging iets mis bij het bijwerken van de status", "destructive");
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
        {/* Loading State */}
        {(roomsLoading || tasksLoading) && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Gegevens laden...</p>
          </div>
        )}

        {/* Error State */}
        {(roomsError || tasksError) && (
          <div className="text-center py-16">
            <div className="mx-auto max-w-sm">
              <p className="text-destructive mb-4">
                {roomsError || tasksError}
              </p>
              <p className="text-sm text-muted-foreground">
                Offline modus actief - gegevens uit cache geladen
              </p>
            </div>
          </div>
        )}

        {/* Content - only show when not loading */}
        {!roomsLoading && !tasksLoading && (
          <>
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
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roomCards}
              
              {/* Add Room Card */}
              <div 
                onClick={openRoomForm}
                className="group relative bg-muted/30 border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 hover:border-muted-foreground/40 hover:bg-muted/50 transition-all cursor-pointer min-h-[200px] flex flex-col items-center justify-center"
              >
                <Plus className="h-8 w-8 text-muted-foreground/60 group-hover:text-muted-foreground/80 mb-2" />
                <span className="text-sm font-medium text-muted-foreground/60 group-hover:text-muted-foreground/80">
                  Nieuwe kamer
                </span>
              </div>
            </div>
          </>
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
          rooms={rooms}
          defaultRoomId={selectedRoomId || null}
          onSubmit={handleTaskSubmit}
        />

        {selectedTask && (
          <TaskEditor
            task={selectedTask}
            rooms={rooms}
            isOpen={!!selectedTask}
            onSave={handleTaskUpdate}
            onClose={closeTaskEditor}
            onDelete={handleTaskDelete}
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
          </>
        )}
      </main>
      
      {/* Debug Panel - only in development */}
      <DebugPanel />
    </div>
  );
} 