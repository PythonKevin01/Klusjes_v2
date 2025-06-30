"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only show after mount to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 px-0">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const themeOptions = [
    { value: "light", icon: Sun, label: "Licht" },
    { value: "dark", icon: Moon, label: "Donker" },
    { value: "system", icon: Monitor, label: "Systeem" },
  ] as const;

  return (
    <div className="flex items-center border border-border rounded-md">
      {themeOptions.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(value)}
          className={cn(
            "h-8 px-2 rounded-none first:rounded-l-md last:rounded-r-md",
            theme === value && "bg-muted"
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </div>
  );
} 