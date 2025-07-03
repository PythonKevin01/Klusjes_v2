"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RoomFormData {
  name: string;
  description: string;
  color: string;
}

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomFormData) => void;
}

const DEFAULT_COLORS = [
  "#6366f1", "#10b981", "#8b5cf6", "#f59e0b", 
  "#ef4444", "#22c55e", "#06b6d4", "#f97316", 
  "#ec4899", "#84cc16"
];

export function RoomForm({ isOpen, onClose, onSubmit }: RoomFormProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    description: "",
    color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        description: "",
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      });
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      name: "",
      description: "",
      color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe kamer toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="room-name" className="block text-sm font-medium mb-1 text-card-foreground">
              Kamer naam *
            </label>
            <input
              id="room-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Bijv. Zolder, Garage, Berging..."
              required
            />
          </div>

          <div>
            <label htmlFor="room-description" className="block text-sm font-medium mb-1 text-card-foreground">
              Beschrijving
            </label>
            <textarea
              id="room-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Optionele beschrijving..."
              rows={2}
            />
          </div>



          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Kamer toevoegen
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