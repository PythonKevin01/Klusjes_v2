"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    estimatedDuration: number;
    priority: boolean;
  }) => void;
}

export function TaskForm({ isOpen, onClose, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    estimatedDuration: 30,
    priority: false,
  });

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedDuration: formData.estimatedDuration,
        priority: formData.priority,
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        estimatedDuration: 30,
        priority: false,
      });
    }
  }, [formData, onSubmit]);

  const handleClose = React.useCallback(() => {
    onClose();
    // Reset form on close
    setFormData({
      title: "",
      description: "",
      estimatedDuration: 30,
      priority: false,
    });
  }, [onClose]);

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
              🏆 Hoge prioriteit
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Klusje toevoegen
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuleren
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 