"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Room, Task, TaskFormData, TaskPhoto } from "@/types";
import { Trash2, Save, X } from "lucide-react";
import { PhotoUpload } from "./photo-upload";
import { photosApi } from "@/lib/api";

interface TaskEditorProps {
  task: Task | null;
  rooms: Room[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, data: TaskFormData) => void;
  onDelete: (taskId: string) => void;
}

export function TaskEditor({ task, rooms, isOpen, onClose, onSave, onDelete }: TaskEditorProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    roomId: "",
    priority: false,
    dueDate: "",
    estimatedDuration: undefined,
  });

  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string>("");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        roomId: task.roomId,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : "",
        estimatedDuration: task.estimatedDuration,
      });
      setPhotos(task.photos || []);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task && formData.title.trim()) {
      onSave(task.id, formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      onClose();
    }
  };

  const handlePhotoUpload = (photo: { id: string; url: string }) => {
    setPhotos(prev => [...prev, {
      id: photo.id,
      url: photo.url,
      createdAt: new Date()
    }]);
    setUploadError("");
  };

  const handlePhotoError = (error: string) => {
    setUploadError(error);
  };

  const removePhoto = async (photoId: string) => {
    try {
      await photosApi.delete(photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Failed to delete photo:', error);
      setUploadError('Foto verwijderen mislukt');
    }
  };

  if (!task) return null;

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "hsl(var(--status-completed))";
      case "in-progress":
        return "hsl(var(--status-progress))";
      case "waiting":
        return "hsl(var(--status-waiting))";
      default:
        return "hsl(var(--status-todo))";
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "Afgerond";
      case "in-progress":
        return "Bezig";
      case "waiting":
        return "Wachten";
      default:
        return "Te doen";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg mx-auto bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Klusje bewerken</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(task.status) }}
            />
            <span className="text-sm font-medium text-card-foreground">
              {getStatusText(task.status)}
            </span>
          </div>

          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium mb-1 text-card-foreground">
              Titel *
            </label>
            <input
              id="edit-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Wat moet er gedaan worden?"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium mb-1 text-card-foreground">
              Beschrijving
            </label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Extra details..."
              rows={3}
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-card-foreground">
              Foto's
            </label>
            
            {/* Photo Gallery */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt="Task photo"
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Upload */}
            <PhotoUpload
              taskId={task.id}
              onUpload={handlePhotoUpload}
              onError={handlePhotoError}
            />
            
            {uploadError && (
              <p className="text-sm text-destructive mt-1">{uploadError}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-room" className="block text-sm font-medium mb-1 text-card-foreground">
              Kamer *
            </label>
            <select
              id="edit-room"
              value={formData.roomId}
              onChange={(e) =>
                setFormData({ ...formData, roomId: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="edit-priority"
              type="checkbox"
              checked={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-border text-yellow-500 focus:ring-yellow-500 bg-input"
            />
            <label htmlFor="edit-priority" className="text-sm font-medium text-card-foreground">
              Prioriteit 🏆
            </label>
          </div>

          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium mb-1 text-card-foreground">
              Status
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Task["status"],
                })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="todo">Te doen</option>
              <option value="in-progress">Bezig</option>
              <option value="waiting">Wachten</option>
              <option value="completed">Klaar</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-due-date" className="block text-sm font-medium mb-1 text-card-foreground">
                Deadline
              </label>
              <input
                id="edit-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="edit-duration" className="block text-sm font-medium mb-1 text-card-foreground">
                Tijd (min)
              </label>
              <input
                id="edit-duration"
                type="number"
                value={formData.estimatedDuration || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="30"
                min="1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              variant="outline"
              className="flex-1 border-[hsl(var(--priority-high))] text-[hsl(var(--priority-high))] hover:bg-[hsl(var(--priority-high))/10]"
            >
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDelete}
              className="px-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 