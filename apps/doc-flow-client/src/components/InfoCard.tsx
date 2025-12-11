import { FileText, Tag } from "lucide-react";

interface InfoCardProps {
  label: string;
  data: string;
}

export function InfoCard({ data, label }: InfoCardProps) {
  return (
    <div className="rounded-xl border bg-sky-50 border-neutral-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-sky-900">{label}</p>
          <p className="text-lg font-semibold text-sky-900 mt-0.5 truncate">
            {data}
          </p>
        </div>
      </div>
    </div>
  )
}
