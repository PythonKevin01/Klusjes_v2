"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { storage } from "@/lib/utils";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("Unknown");

  const testAPI = async () => {
    try {
      setApiStatus("Testing...");
      console.log("Testing API at /api/test.php");
      
      const response = await fetch("/api/test.php");
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      setApiStatus(`✅ ${data.message || "API works!"}`);
    } catch (error) {
      console.error("API Test Error:", error);
      setApiStatus(`❌ ${error instanceof Error ? error.message : "API failed"}`);
    }
  };

  const initializeData = async () => {
    try {
      setApiStatus("Initializing...");
      const response = await fetch("/api/init-data.php");
      const data = await response.json();
      if (data.status === 'success') {
        setApiStatus(`✅ ${data.message} - ${data.rooms_created} rooms, ${data.tasks_created} tasks`);
        // Clear cache to force reload
        clearCache();
      } else {
        setApiStatus(`❌ Init failed: ${data.message}`);
      }
    } catch (error) {
      setApiStatus(`❌ ${error instanceof Error ? error.message : "Init failed"}`);
    }
  };

  const clearCache = () => {
    storage.remove("klusjes-rooms");
    storage.remove("klusjes-tasks");
    storage.remove("pending-sync");
    setApiStatus("🗑️ Cache cleared - reload page");
    setTimeout(() => window.location.reload(), 1000);
  };

  const testDirectFetch = async () => {
    try {
      setApiStatus("Testing direct...");
      console.log("Testing direct fetch to rooms API");
      
      const response = await fetch("https://klusjes.casa/api/rooms.php", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Direct response:", response);
      const text = await response.text();
      console.log("Response text:", text);
      
      setApiStatus(`Direct: ${response.status} - ${text.substring(0, 100)}...`);
    } catch (error) {
      console.error("Direct fetch error:", error);
      setApiStatus(`❌ Direct failed: ${error}`);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        🐛 Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Debug Panel</h3>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">×</Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm space-y-1">
          <div>
            <strong>API Status:</strong><br />
            <span className="text-xs">{apiStatus}</span>
          </div>
          <div>
            <strong>Sync Mode:</strong><br />
            <span className="text-xs">🔄 Smart Polling (3s)</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button onClick={testAPI} size="sm" variant="outline">
            Test API
          </Button>
          <Button onClick={initializeData} size="sm" variant="outline">
            Initialize Data
          </Button>
          <Button onClick={testDirectFetch} size="sm" variant="outline">
            Test Direct
          </Button>
          <Button onClick={clearCache} size="sm" variant="destructive">
            Clear Cache
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Cache: {JSON.stringify({
            rooms: !!storage.get("klusjes-rooms", null),
            tasks: !!storage.get("klusjes-tasks", null)
          })}
        </div>
      </div>
    </div>
  );
} 