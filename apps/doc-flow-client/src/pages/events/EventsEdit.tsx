import { EventCreateSchema, Event, createEventSchema } from "@/lib/types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventsForm from "@/components/events/EventsForm";
import PageHeader from "@/components/PageHeader";
import { eventService } from "@/api/services/event.service";
import { toast } from "sonner";
import { ApiError } from "@/api/errors/ApiError";

export default function EventsEdit() {
  const [event, setEvent] = useState<Event | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchEvent = async (id: string) => {
    try {
      const data = await eventService.getOne(id);
      setEvent(data.event);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("erro inesperado ao procurar eventos")
    }
  };

  const form = useForm<EventCreateSchema>({
    resolver: zodResolver(createEventSchema),
    defaultValues: event
      ? {
        name: event.name,
        status: event.status,
        eventStartDate: event.start_at,
        eventEndDate: event.end_at,
        description: event.description,
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
        vacancies: event.vacancies,
      }
      : undefined,
  });

  useEffect(() => {
    const id = location.pathname.split("/")[2];
    if (!id) {
      navigate("/events");
    }
    fetchEvent(id);
  }, [location.pathname, navigate]);

  const handleSubmit = async (
    data: Omit<EventCreateSchema, "eventStartTime" | "eventEndTime">,
  ) => {
    if (!event) {
      return;
    }

    const result = await eventService.patch(event?.id, data);
    if (result !== undefined) {
      navigate("/events", {
        state: {
          action: "update",
          message: "Evento atualizado com sucesso",
        },
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Editando evento"
        description="Edite as informações do evento e clique em confirmar para salvar as alterações"
      />
      {event && (
        <EventsForm form={form} onSubmit={handleSubmit} event={event} mode="edit" />
      )}
    </div>
  );
}
