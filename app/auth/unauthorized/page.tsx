"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDarkMode } from "@/lib/hooks/useDarkMode";
import { Moon, Sun } from "lucide-react";

export default function UnauthorizedPage() {
  const { signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <Sun /> : <Moon />}
        </Button>
      </div>
      
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-destructive">Unauthorized Access</h1>
        <p className="text-lg mb-6 text-muted-foreground">
          You do not have admin privileges to access this dashboard.
        </p>
        <div className="flex flex-col gap-2 justify-center">
          <Button variant="default" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}