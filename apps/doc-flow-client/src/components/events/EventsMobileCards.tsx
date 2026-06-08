import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { CalendarDays, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DataTablePagination from "../DataTablePagination";
import { Event } from "@/lib/schemas/event.schema";
import { tableEventType } from "./EventsTable";

interface EventsMobileCardsProps {
  table: TanstackTable<Event>;
  tableType: tableEventType;
}

const statusStyles: Record<Event["status"], { label: string; className: string }> = {
  upcoming: {
    label: "Próximo",
    className: "bg-sky-100 text-sky-700 ring-sky-600/20",
  },
  started: {
    label: "Em andamento",
    className: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  },
  ended: {
    label: "Encerrado",
    className: "bg-neutral-200 text-neutral-600 ring-neutral-500/20",
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Não definido";
  }
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsMobileCards({ table, tableType }: EventsMobileCardsProps) {
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      {rows.length ? (
        rows.map((row) => {
          const event = row.original;
          const status = statusStyles[event.status] ?? statusStyles.upcoming;
          const actionsCell = row
            .getVisibleCells()
            .find((cell) => cell.column.id === "actions");

          return (
            <Card key={row.id} className="transition-colors hover:bg-sky-50">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <CardTitle className="text-neutral-800">{event.name}</CardTitle>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${status.className}`}
                >
                  {status.label}
                </span>
              </CardHeader>

              <CardContent className="space-y-3">
                {tableType === "all" && event.user?.full_name && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="rounded-lg text-[10px]">
                        {event.user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{event.user.full_name}</span>
                  </div>
                )}

                <dl className="space-y-1.5 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-sky-700" />
                    <dt className="sr-only">Data de início</dt>
                    <dd>{formatDate(event.start_at)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-sky-700" />
                    <dt className="sr-only">Vagas</dt>
                    <dd>{event.vacancies ?? 0} vagas</dd>
                  </div>
                </dl>
              </CardContent>

              {actionsCell && (
                <CardFooter className="flex-wrap gap-2 border-t pt-3">
                  {flexRender(
                    actionsCell.column.columnDef.cell,
                    actionsCell.getContext()
                  )}
                </CardFooter>
              )}
            </Card>
          );
        })
      ) : (
        <Card className="py-10 text-center text-sm text-neutral-500">
          Nenhum evento encontrado.
        </Card>
      )}

      <DataTablePagination table={table} />
    </div>
  );
}
