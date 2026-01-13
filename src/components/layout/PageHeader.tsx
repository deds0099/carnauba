import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="h-9 w-9 border-farm-primary text-farm-primary hover:bg-farm-primary/10"
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-farm-primary">{title}</h1>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
} 