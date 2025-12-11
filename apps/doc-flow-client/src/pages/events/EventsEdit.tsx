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
    try {
      await eventService.patch(event!.id, data);
      navigate("/events");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Erro inesperado ao editar evento.");
    }
  };

  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        status: event.status,
        eventStartDate: event.start_at.split("T")[0],
        eventEndDate: event.end_at.split("T")[0],
        eventStartTime: event.start_at.split("T")[1].slice(0, 5),
        eventEndTime: event.end_at.split("T")[1].slice(0, 5),
        description: event.description,
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
        vacancies: event.vacancies,
      })
    }
  }, [event])

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
