"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Room } from "@/types";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  defaultRoomId: string | null;
  onSubmit: (data: {
    title: string;
    description: string;
    estimatedDuration: number;
    priority: boolean;
    roomId: string;
    dueDate?: string;
  }) => void;
}

export function TaskForm({ isOpen, onClose, rooms, defaultRoomId, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    estimatedDuration: 30,
    priority: false,
    roomId: defaultRoomId || "",
    dueDate: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        roomId: defaultRoomId || prev.roomId,
      }));
    }
  }, [isOpen, defaultRoomId]);

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedDuration: formData.estimatedDuration,
        priority: formData.priority,
        roomId: formData.roomId || defaultRoomId || "",
        dueDate: formData.dueDate || undefined,
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        estimatedDuration: 30,
        priority: false,
        roomId: defaultRoomId || "",
        dueDate: "",
      });
    }
  }, [formData, onSubmit, defaultRoomId]);

  const handleClose = React.useCallback(() => {
    onClose();
    // Reset form on close
    setFormData({
      title: "",
      description: "",
      estimatedDuration: 30,
      priority: false,
      roomId: defaultRoomId || "",
      dueDate: "",
    });
  }, [onClose, defaultRoomId]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuw klusje toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Titel *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Wat moet er gedaan worden?"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Beschrijving
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Extra details..."
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="estimatedDuration" className="block text-sm font-medium mb-1">
              Geschatte tijd (minuten)
            </label>
            <input
              id="estimatedDuration"
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedDuration: parseInt(e.target.value) || 30,
                })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="30"
              min="1"
              max="480"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="priority"
              type="checkbox"
              checked={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-border text-yellow-500 focus:ring-yellow-500"
            />
            <label htmlFor="priority" className="text-sm font-medium">
              <span className="text-[hsl(var(--priority-high))]">prio</span> Hoge prioriteit
            </label>
          </div>

          {/* Room select */}
          <div>
            <label htmlFor="room-select" className="block text-sm font-medium mb-1">
              Kamer *
            </label>
            <select
              id="room-select"
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="" disabled>Kies een kamer</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label htmlFor="due-date" className="block text-sm font-medium mb-1">
              Deadline
            </label>
            <input
              id="due-date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              variant="outline" 
              className="flex-1 border-[hsl(var(--priority-high))] text-[hsl(var(--priority-high))] hover:bg-[hsl(var(--priority-high))/10]"
            >
              Klusje toevoegen
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-[hsl(var(--priority-high))] text-[hsl(var(--priority-high))] hover:bg-[hsl(var(--priority-high))/10]"
            >
              Annuleren
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 