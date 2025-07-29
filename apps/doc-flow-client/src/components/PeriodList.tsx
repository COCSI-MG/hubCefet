"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ScheduleTable from "@/components/ScheduleTable";

interface Period {
  id: string;
  name: string;
  subjects: {
    id: string;
    name: string;
    code: string;
    schedule: string;
  }[];
}

interface PeriodListProps {
  periods: Period[];
}

export function PeriodList({ periods }: PeriodListProps) {
  const [expandedPeriods, setExpandedPeriods] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (periods?.length === 1) {
      setExpandedPeriods(new Set([periods[0].id]));
    }
  }, [periods]);

  const togglePeriod = (periodId: string) => {
    setExpandedPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(periodId)) {
        next.delete(periodId);
      } else {
        next.add(periodId);
      }
      return next;
    });
  };

  if (!periods || periods.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        Nenhum período acadêmico encontrado
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {periods.map((period) => (
        <div key={period.id} className="rounded-lg border border-border">
          <button
            onClick={() => togglePeriod(period.id)}
            className="flex w-full items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground"
          >
            <span className="font-medium">{period.name}</span>
            {expandedPeriods.has(period.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all",
              expandedPeriods.has(period.id) ? "h-auto" : "h-0"
            )}
          >
            <div className="p-4 pt-0">
              <ScheduleTable subjects={period.subjects || []} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 