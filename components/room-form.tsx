"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface RoomFormData {
  name: string;
  color: string;
}

interface RoomFormProps {
  onSubmit: (data: RoomFormData) => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = [
  "#6366f1", "#10b981", "#8b5cf6", "#f59e0b", 
  "#ef4444", "#22c55e", "#06b6d4", "#f97316", 
  "#ec4899", "#84cc16"
];

export function RoomForm({ onSubmit, onCancel }: RoomFormProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-card-foreground">Nieuwe kamer toevoegen</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
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



          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Kamer toevoegen
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuleren
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 