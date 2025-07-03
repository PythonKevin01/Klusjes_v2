"use client";

import { useState, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { uploadPhoto } from "@/lib/api";

interface PhotoUploadProps {
  taskId: string;
  onUpload: (photo: { id: string; url: string }) => void;
  onError?: (error: string) => void;
}

export function PhotoUpload({ taskId, onUpload, onError }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onError?.("Selecteer een afbeelding bestand");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const result = await uploadPhoto(file, taskId);
      onUpload({ id: result.id, url: result.url });
      setPreview(null);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      onError?.((error as Error).message || "Upload mislukt");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const cancelUpload = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {isUploading ? (
              <div className="text-white">
                <Upload className="h-8 w-8 animate-pulse mb-2 mx-auto" />
                <p className="text-sm">Uploaden...</p>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={cancelUpload}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-20 border-dashed"
          onClick={handleCameraClick}
          disabled={isUploading}
        >
          <Camera className="h-6 w-6 mr-2" />
          Foto toevoegen
        </Button>
      )}
    </div>
  );
} 