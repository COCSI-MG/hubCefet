import { ApiError } from "@/api/errors/ApiError";
import { eventService } from "@/api/services/event.service";
import { EventsDataTable } from "@/components/events/EventsTable";
import PageHeader from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Event, Pagination as PaginationArgs } from "@/lib/types";

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export default function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchEvents = async (pagination: PaginationArgs) => {
    try {
      const response = await eventService.getAll({
        limit: pagination.limit,
        offset: pagination.offset
      });

      setEvents(response);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("Não foi possível carregar os eventos.");
    }
  };

  useEffect(() => {
    fetchEvents({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });
  }, [pagination, pagination.pageIndex, pagination.pageSize]);

  return (
    <div>
      <PageHeader
        title="Todos os eventos"
        description="Use o mecanismo de busca ou a ferramenta de filtros para encontrar o evento que deseja"
      />
      <div className="container max-w-full flex flex-col space-y-2 p-6 h-fit">
        <div className="p-1">
          <EventsDataTable events={events} fetchEvents={fetchEvents} setPagination={setPagination} pagination={pagination} tableType="all" />
        </div>
      </div>
    </div>
  );
}
