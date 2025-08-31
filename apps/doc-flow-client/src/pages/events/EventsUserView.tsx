import PageHeader from "@/components/PageHeader";
import { components } from "@/lib/schema";
import { useCallback, useEffect, useState } from "react";
import { getUserEvents } from "@/api/data/events.data";
import useAuth from "@/hooks/useAuth";
import ViewUserEventsBox from "@/components/events/ViewUserEventsBox";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Event = components["schemas"]["Event"];

export default function EventsUserView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 10,
  });
  const { user } = useAuth();
  const [eventsOnGoing, setEventsOnGoing] = useState<Event[]>([]);
  const location = useLocation();

  const fetchUsersEvents = useCallback(async () => {
    const userId = user?.sub;
    if (!userId) {
      return;
    }
    const data = await getUserEvents({
      id: userId,
      offset: 0,
      limit: 10,
    });
    if (!data) {
      return;
    }
    setEvents(data);
  }, [user]);

  const handleEventsOnGoing = useCallback(async () => {
    const eventsOnGoing = events.filter((event) => {
      return event.status === "started";
    });
    setEventsOnGoing(eventsOnGoing);
  }, [events]);

  const handleEventSearch = async (search: string) => {
    if (!search) {
      return fetchUsersEvents();
    }
    const event = events.filter((event) => {
      return event.name.includes(search);
    });
    if (!event) {
      return;
    }
    setEvents(event);
  };

  const handlePagination = async (offset: number) => {
    const userId = user?.sub;
    if (!userId) {
      return;
    }
    const data = await getUserEvents({
      id: userId,
      offset: offset,
      limit: 10,
    });
    if (!data) return;
    setEvents(data);
    setPagination({ offset, limit: 10 });
  };

  useEffect(() => {
    fetchUsersEvents();
  }, [fetchUsersEvents]);

  useEffect(() => {
    handleEventsOnGoing();
  }, [events, handleEventsOnGoing]);

  return (
    <div>
      <PageHeader
        title="Meus eventos"
        description={`${eventsOnGoing.length} eventos em andamento`}
      />
      <div className="container max-w-full space-y-4 p-6">
        {location?.state?.action === "update" && (
          <Alert className="bg-slate-300 rounded-2xl animate-bounce">
            <AlertCircle className="w-6 h-6 text-neutral-600" />
            <AlertTitle className="text-slate-900 ml-2">
              Atualização de evento
            </AlertTitle>
            <AlertDescription className="text-slate-900 ml-2">
              {location?.state.message}
            </AlertDescription>
          </Alert>
        )}
        <SearchBar
          placeholder="Buscar eventos"
          onChange={(event) => handleEventSearch(event.target.value)}
        />
        <div className="flex flex-row max-md:w-full max-md:justify-center max-md:flex-col">
          <Link to="/events/create">
            <Button className="bg-sky-900 text-white rounded-xl w-32 max-md:w-full max-md:min-h-12">
              Criar evento
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          {events &&
            events.map((event) => {
              return <ViewUserEventsBox key={event.id} event={event} />;
            })}
          {events.length === 0 && (
            <div className="p-2 text-neutral-600">
              Você ainda não criou nenhum evento. Clique no botão acima para
              criar um evento.
            </div>
          )}
        </div>
        {events.length > 0 && (
          <div className="flex flex-row justify-end mt-4 space-x-4 max-md:justify-center max-md:flex-col max-md:space-x-0 max-md:space-y-4">
            <Button
              className="bg-sky-900 text-white rounded-xl w-32 max-md:w-full"
              disabled={pagination.offset === 0}
              onClick={() => handlePagination(pagination.offset - 1)}
            >
              Previous
            </Button>
            <Button
              className="bg-sky-900 text-white rounded-xl w-32 max-md:w-full"
              disabled={events.length < pagination.limit}
              onClick={() => handlePagination(pagination.offset + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
