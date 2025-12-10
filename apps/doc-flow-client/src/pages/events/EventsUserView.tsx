import { ApiError } from "@/api/errors/ApiError";
import { eventService } from "@/api/services/event.service";
import { EventsDataTable } from "@/components/events/EventsTable";
import PageHeader from "@/components/PageHeader";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Event, Pagination as PaginationArgs } from "@/lib/types";
import useAuth from "@/hooks/useAuth";

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
  const [eventsOnGoing, setEventsOnGoing] = useState<Event[]>([]);
  const { user } = useAuth();

  const fetchUserEvents = useCallback(async (pagination: PaginationArgs) => {
    const userId = user?.sub;
    if (!userId) {
      return;
    }

    try {
      const response = await eventService.getUserEvents({
        id: userId,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      setEvents(response);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Não foi possível carregar os eventos.");
    }
  }, [user]);

  const handleEventsOnGoing = useCallback(async () => {
    const eventsOnGoing = events.filter((event) => {
      return event.status === "started";
    });
    setEventsOnGoing(eventsOnGoing);
  }, [events]);

  useEffect(() => {
    fetchUserEvents({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });
  }, [pagination, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    handleEventsOnGoing();
  }, [events, handleEventsOnGoing]);

  return (
    <div>
      <PageHeader
        title="Meus eventos"
        description={`${eventsOnGoing.length} eventos em andamento`}
      />
      <div className="container max-w-full flex flex-col space-y-2 p-6 h-fit">
        <div className="p-1">
          <EventsDataTable events={events} fetchEvents={fetchUserEvents} setPagination={setPagination} pagination={pagination} tableType="user" />
        </div>
      </div>
    </div>
  );
}
