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
        start_at: event.start_at,
        end_at: event.end_at,
        description: event.description,
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
        vacancies: event.vacancies,
        presence_option: event.presence_option,
        min_checkin_time: event.min_checkin_time ?? 15,
        max_checkin_time: event.max_checkin_time ?? 15,
        min_checkout_time: event.min_checkout_time ?? 15,
        max_checkout_time: event.max_checkout_time ?? 15,
        activity_type_id: event.activity_type_id?.toString() ?? undefined,
        complementary_activity_type_id: event.complementary_activity_type_id?.toString() ?? undefined,
        extension_activity_type_id: event.extension_activity_type_id?.toString() ?? undefined,
        activity_hours: event.activity_hours ?? undefined,
      }
      : {
        name: "",
        description: "",
        start_at: "",
        end_at: "",
        eventStartTime: "",
        eventEndTime: "",
        latitude: 0,
        longitude: 0,
        radius: 10,
        vacancies: 1,
        presence_option: "qrcode",
        min_checkin_time: 15,
        max_checkin_time: 15,
        min_checkout_time: 15,
        max_checkout_time: 15,
        activity_type_id: undefined,
        complementary_activity_type_id: undefined,
        extension_activity_type_id: undefined,
        activity_hours: undefined,
      },
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

  const handleSubmit = async (data: EventCreateSchema) => {
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
        min_checkin_time: event.min_checkin_time,
        max_checkin_time: event.max_checkin_time,
        min_checkout_time: event.min_checkout_time,
        max_checkout_time: event.max_checkout_time,
        activity_type_id: event.activity_type_id?.toString() ?? undefined,
        complementary_activity_type_id: event.complementary_activity_type_id?.toString() ?? undefined,
        extension_activity_type_id: event.extension_activity_type_id?.toString() ?? undefined,
        activity_hours: event.activity_hours ?? undefined,
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
