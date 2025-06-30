"use client";

import React from "react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskProgressBarProps {
  tasks: Task[];
  className?: string;
  showPercentage?: boolean;
}

export const TaskProgressBar = React.memo(function TaskProgressBar({ 
  tasks, 
  className,
  showPercentage = false 
}: TaskProgressBarProps) {
  const stats = React.useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return { 
        completed: 0, 
        inProgress: 0, 
        waiting: 0, 
        todo: 0, 
        completedPercentage: 0,
        inProgressPercentage: 0,
        waitingPercentage: 0,
        todoPercentage: 0
      };
    }

    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const waiting = tasks.filter(t => t.status === "waiting").length;
    const todo = tasks.filter(t => t.status === "todo").length;

    return {
      completed,
      inProgress,
      waiting,
      todo,
      completedPercentage: (completed / total) * 100,
      inProgressPercentage: (inProgress / total) * 100,
      waitingPercentage: (waiting / total) * 100,
      todoPercentage: (todo / total) * 100,
    };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-muted-foreground/20"></div>
        </div>
        <div className="text-xs text-muted-foreground">Geen klusjes</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden flex">
        {/* Completed */}
        {stats.completedPercentage > 0 && (
          <div
            className="bg-[hsl(var(--status-completed))] transition-all duration-500 ease-out"
            style={{ width: `${stats.completedPercentage}%` }}
            title={`${stats.completed} voltooid`}
          />
        )}
        {/* In Progress */}
        {stats.inProgressPercentage > 0 && (
          <div
            className="bg-[hsl(var(--status-progress))] transition-all duration-500 ease-out"
            style={{ width: `${stats.inProgressPercentage}%` }}
            title={`${stats.inProgress} bezig`}
          />
        )}
        {/* Waiting */}
        {stats.waitingPercentage > 0 && (
          <div
            className="bg-[hsl(var(--status-waiting))] transition-all duration-500 ease-out"
            style={{ width: `${stats.waitingPercentage}%` }}
            title={`${stats.waiting} wachtend`}
          />
        )}
        {/* Todo */}
        {stats.todoPercentage > 0 && (
          <div
            className="bg-[hsl(var(--status-todo))] transition-all duration-500 ease-out"
            style={{ width: `${stats.todoPercentage}%` }}
            title={`${stats.todo} todo`}
          />
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--status-completed))]"></div>
            {stats.completed}
          </span>
          {stats.inProgress > 0 && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--status-progress))]"></div>
              {stats.inProgress}
            </span>
          )}
          {stats.waiting > 0 && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--status-waiting))]"></div>
              {stats.waiting}
            </span>
          )}
          {stats.todo > 0 && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--status-todo))]"></div>
              {stats.todo}
            </span>
          )}
        </div>
        
        {showPercentage && stats.completedPercentage > 0 && (
          <span className="font-medium status-completed">
            {Math.round(stats.completedPercentage)}%
          </span>
        )}
      </div>
    </div>
  );
}); 