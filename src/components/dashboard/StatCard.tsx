import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "success" | "warning" | "alert";
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const variantShadows = {
    default: "hover:shadow-primary/5",
    success: "hover:shadow-emerald-500/10",
    warning: "hover:shadow-amber-500/10",
    alert: "hover:shadow-rose-500/10",
  };

  const iconGradients = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    alert: "bg-rose-500/10 text-rose-600",
  };

  const trendColor = trend?.positive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50";

  return (
    <Card
      className={cn(
        "card-hover border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 overflow-hidden",
        variantShadows[variant]
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {icon && (
          <div className={cn("p-2.5 rounded-xl transition-all duration-300", iconGradients[variant])}>
            {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 2.5 })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold tracking-tight text-primary">{value}</div>
          {trend && (
            <div className={cn("flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold", trendColor)}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
