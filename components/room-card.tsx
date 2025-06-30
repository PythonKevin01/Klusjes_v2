"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskProgressBar } from "@/components/task-progress-bar";
import { Room, Task } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronDown, CheckCircle2, Clock, AlertCircle, Trash2, Play, Pause } from "lucide-react";

interface RoomCardProps {
  room: Room;
  tasks: Task[];
  onAddTask: (roomId: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskProgress: (taskId: string) => void;
}

export const RoomCard = React.memo(function RoomCard({ 
  room, 
  tasks, 
  onAddTask, 
  onTaskClick, 
  onTaskDelete, 
  onTaskProgress 
}: RoomCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Memoized computed values for performance
  const taskCounts = React.useMemo(() => {
    const completed = tasks.filter(task => task.status === "completed");
    const pending = tasks.filter(task => task.status !== "completed");
    
    return { completed, pending };
  }, [tasks]);

  const { completed: completedTasks, pending: pendingTasks } = taskCounts;

  // Memoized handlers
  const handleAddTask = React.useCallback(() => {
    onAddTask(room.id);
  }, [onAddTask, room.id]);

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const getStatusIcon = React.useCallback((status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" style={{ color: "hsl(var(--status-completed))" }} />;
      case "in-progress":
        return <Clock className="h-4 w-4" style={{ color: "hsl(var(--status-progress))" }} />;
      case "waiting":
        return <Pause className="h-4 w-4" style={{ color: "hsl(var(--status-waiting))" }} />;
      default:
        return <AlertCircle className="h-4 w-4" style={{ color: "hsl(var(--status-todo))" }} />;
    }
  }, []);

  const getPriorityBorder = React.useCallback((priority: boolean) => {
    return priority 
      ? "border-l-[3px] border-l-[hsl(var(--priority-high))]" 
      : "border-l-[3px] border-l-transparent";
  }, []);

  return (
    <Card className="h-fit transition-all duration-300 hover:bg-card/80 border-border card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground text-balance">
            {room.name}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleExpanded}
            className={cn(
              "h-8 w-8 p-0 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
            aria-label={isExpanded ? "Inklappen" : "Uitklappen"}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        {room.description && (
          <p className="text-sm text-muted-foreground font-normal">{room.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Only the colored progress bar - no text stats */}
        <TaskProgressBar tasks={tasks} />

        {/* Expandable tasks section */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Klusjes</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddTask}
                className="h-7 px-2 text-xs"
                title={`Nieuw klusje voor ${room.name}`}
              >
                + Toevoegen
              </Button>
            </div>
            
            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground animate-fade-in">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 status-completed" />
                <p className="text-sm">Alle klusjes afgerond! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingTasks.map((task) => (
                  <MemoizedSwipeableTaskItem
                    key={task.id}
                    task={task}
                    onTap={onTaskClick}
                    onSwipeLeft={onTaskProgress}
                    onSwipeRight={onTaskDelete}
                    statusIcon={getStatusIcon(task.status)}
                    priorityBorder={getPriorityBorder(task.priority)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

interface SwipeableTaskItemProps {
  task: Task;
  onTap: (task: Task) => void;
  onSwipeLeft: (taskId: string) => void;
  onSwipeRight: (taskId: string) => void;
  statusIcon: React.ReactNode;
  priorityBorder: string;
}

const SwipeableTaskItem = React.memo(function SwipeableTaskItem({ 
  task, 
  onTap, 
  onSwipeLeft, 
  onSwipeRight, 
  statusIcon, 
  priorityBorder 
}: SwipeableTaskItemProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const dragStartX = React.useRef(0);
  const dragStartTime = React.useRef(0);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartTime.current = Date.now();
    setIsDragging(true);
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStartX.current;
    setDragOffset(Math.max(-150, Math.min(150, diff)));
  }, [isDragging]);

  const handleTouchEnd = React.useCallback(() => {
    const dragDuration = Date.now() - dragStartTime.current;
    const absDragOffset = Math.abs(dragOffset);
    
    if (dragDuration < 200 && absDragOffset < 10) {
      // Tap
      onTap(task);
    } else if (absDragOffset > 80) {
      // Swipe
      if (dragOffset > 0) {
        onSwipeLeft(task.id); // Swipe right = activate/progress
      } else {
        onSwipeRight(task.id); // Swipe left = delete
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  }, [dragOffset, onTap, onSwipeLeft, onSwipeRight, task]);

  const handleClick = React.useCallback(() => {
    onTap(task);
  }, [onTap, task]);

  const getBackgroundAction = React.useCallback(() => {
    if (Math.abs(dragOffset) < 80) return null;
    
    if (dragOffset > 0) {
      return (
        <div className="absolute inset-y-0 left-0 flex items-center px-4 bg-blue-500/20 rounded-md">
          <Play className="h-4 w-4 text-blue-400" />
        </div>
      );
    } else {
      return (
        <div className="absolute inset-y-0 right-0 flex items-center px-4 bg-red-500/20 rounded-md">
          <Trash2 className="h-4 w-4 text-red-400" />
        </div>
      );
    }
  }, [dragOffset]);

  return (
    <div className="relative overflow-hidden rounded-md">
      {getBackgroundAction()}
      <div
        className={cn(
          "relative flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-md cursor-pointer transition-all touch-pan-y",
          priorityBorder,
          isDragging ? "transition-none" : "transition-transform duration-200"
        )}
        style={{
          transform: `translateX(${dragOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTap(task);
          }
        }}
        aria-label={`${task.title} - ${task.status}`}
      >
        {statusIcon}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-card-foreground truncate">
            {task.title}
          </div>
          {task.description && (
            <div className="text-xs text-muted-foreground truncate">
              {task.description}
            </div>
          )}
          {task.estimatedDuration && (
            <div className="text-xs text-muted-foreground">
              ⏱️ {task.estimatedDuration} min
            </div>
          )}
        </div>
        {task.priority && (
          <div className="text-xs priority-high" title="Hoge prioriteit">
            🏆
          </div>
        )}
      </div>
    </div>
  );
});

// Export memoized version
const MemoizedSwipeableTaskItem = React.memo(SwipeableTaskItem); 