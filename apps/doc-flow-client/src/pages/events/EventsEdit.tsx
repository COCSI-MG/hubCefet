import { EventCreateSchema, Event, createEventSchema, EventCreate } from "@/lib/types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventsForm from "@/components/events/EventsForm";
import PageHeader from "@/components/PageHeader";
import { eventService } from "@/api/services/event.service";
import { toast } from "sonner";
import { ApiError } from "@/api/errors/ApiError";
import { FormatFormDateToLocal } from "@/lib/utils/form";

export default function EventsEdit() {
  const [event, setEvent] = useState<Event | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const form = useForm<EventCreateSchema>({
    resolver: zodResolver(createEventSchema),
    defaultValues: event
      ? {
        name: event.name,
        status: event.status,
        start_at: event.start_at,
        end_at: event.end_at,
        description: event.description,
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
        vacancies: event.vacancies,
        presence_option: event.presence_option,
      }
      : undefined,
  });

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

  useEffect(() => {
    const id = location.pathname.split("/")[2];
    if (!id) {
      navigate("/events");
    }
    fetchEvent(id);
  }, [location.pathname, navigate]);

  const handleSubmit = async (data: EventCreate) => {
    try {
      await eventService.patch(event!.id, data);
      toast.success("Evento atualizado com sucesso");
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
      const startParts = FormatFormDateToLocal(event.start_at);
      const endParts = FormatFormDateToLocal(event.end_at);

      form.reset({
        name: event.name,
        status: event.status,
        start_at: startParts.date,
        eventStartTime: startParts.time,
        end_at: endParts.date,
        eventEndTime: endParts.time,
        description: event.description,
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
        vacancies: event.vacancies,
        presence_option: event.presence_option,
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
