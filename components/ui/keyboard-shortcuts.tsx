"use client";

import * as React from "react";
import { isKeyboardEvent } from "@/lib/utils";
import { useToast } from "./toast";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  children: React.ReactNode;
}

export function KeyboardShortcuts({ shortcuts, children }: KeyboardShortcutsProps) {
  const { toast } = useToast();
  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show/hide help with Ctrl+/
      if (isKeyboardEvent(event, "/", { ctrl: true })) {
        event.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Find matching shortcut
      const shortcut = shortcuts.find(s =>
        isKeyboardEvent(event, s.key, {
          ctrl: s.ctrl,
          shift: s.shift,
          alt: s.alt,
        })
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
        
        // Show toast feedback
        toast({
          title: "Sneltoets gebruikt",
          description: shortcut.description,
          duration: 2000,
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, toast]);

  return (
    <>
      {children}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">
              Sneltoetsen
            </h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    {shortcut.ctrl && "Ctrl+"}
                    {shortcut.shift && "Shift+"}
                    {shortcut.alt && "Alt+"}
                    {shortcut.key.toUpperCase()}
                  </kbd>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Toon/verberg deze hulp
                </span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                  Ctrl+/
                </kbd>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
} 