import { Form, FormField } from "@/components/ui/form";
import { PresenceFormSchema } from "@/lib/types";
import FormItemField from "./FormItemField";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { Event } from "@/lib/types";
import { toast } from "sonner";
import { getCurrentPosition } from "@/lib/utils/geolocation";
import { eventService } from "@/api/services/event.service";
import { ApiError } from "@/api/errors/ApiError";

interface PresenceFormProps {
  form: UseFormReturn<PresenceFormSchema>;
  onSubmit: (
    data: PresenceFormSchema,
    coordinates?: { latitude: number; longitude: number }
  ) => void;
  events: Event[];
}
const DEFAULT_RADIUS = 3000;
function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinRange(
  userLat: number,
  userLon: number,
  eventLat: number,
  eventLon: number,
  radius: number = DEFAULT_RADIUS
): boolean {
  const distance = getDistanceFromLatLonInMeters(
    userLat,
    userLon,
    eventLat,
    eventLon
  );

  console.log(`Distância do usuário ao evento: ${distance} metros.`);
  return distance <= radius;
}

export default function PresencesForm({
  form,
  onSubmit,
  events,
}: PresenceFormProps) {
  const [eventExists, setEventExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

  const handleCheckIn = async (data: PresenceFormSchema) => {
    if (!event) {
      toast.error("Evento não encontrado.");
      return;
    }

    try {
      const coordinates = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // 1 minute cache
      });
      const { latitude, longitude } = coordinates;

      console.log("🌍 LOCALIZAÇÃO DO USUÁRIO (CHECK-IN):");
      console.log(`📍 Latitude: ${latitude}`);
      console.log(`📍 Longitude: ${longitude}`);
      console.log(
        `🎯 Localização do evento - Lat: ${event.latitude}, Lng: ${event.longitude}`
      );

      const isInsideOfRange = isWithinRange(latitude, longitude, event.latitude, event.longitude)

      if (!isInsideOfRange) {
        toast.error(
          "Você não está dentro da área do evento para realizar o check-in.",
          { duration: 5000 }
        );
        return
      }

      onSubmit(data, { latitude, longitude });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      console.error(err);
      toast.error(
        "Erro ao obter sua localização. Verifique se a geolocalização está habilitada.",
        { duration: 5000 }
      );
    };
  }

  const validateEventId = async (eventId: string) => {
    if (!eventId) return;

    setLoading(true);

    try {
      const response = await eventService.getOne(eventId);
      const foundEvent = response.data.event;

      if (!foundEvent) {
        setEvent(null);
        setEventExists(false);
        return;
      }

      setEvent(foundEvent);
      setEventExists(true);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        setEvent(null);
        setEventExists(false);
        return;
      }

      console.error(error);
      toast.error("Erro ao buscar informações do evento.");
      setEvent(null);
      setEventExists(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (checkOutDate) {
      form.setValue("check_out_date", checkOutDate);
    }
  }, [checkOutDate, form]);

  useEffect(() => {
    if (defaultDateTime) {
      form.setValue("check_in_date", defaultDateTime);
    }
  }, [defaultDateTime, form]);

  useEffect(() => {
    form.setValue("status", "present");
  }, [form]);

  useEffect(() => {
    if (event && event.end_at) {
      const now = new Date();
      const eventEnd = new Date(event.end_at);

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const timePart = eventEnd.toTimeString().substring(0, 8); // Inclui segundos (HH:MM:SS)

      setCheckOutDate(`${year}-${month}-${day}T${timePart}`);
    }
  }, [event]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCheckIn)}>
          <div className="grid grid-cols-3 p-4 space-x-4 max-md:space-x-0 max-md:flex max-md:flex-col max-md:space-y-4">
            <div className="p-4 flex flex-col space-y-3 border rounded-xl max-md:col-span-0">
              <div>
                <span className="font-bold">Informações Dados</span>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="event_id"
                  render={({ field }) => (
                    <div>
                      <label
                        htmlFor="event_id"
                        className="font-semibold text-sm text-gray-700"
                      >
                        Selecione o Evento
                      </label>
                      <select
                        {...field}
                        id="event_id"
                        className="w-full border rounded-md p-2"
                        onChange={async (e) => {
                          const eventId = e.target.value;
                          field.onChange(eventId);
                          await validateEventId(eventId);
                        }}
                      >
                        <option value="">Selecione um evento...</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name}
                          </option>
                        ))}
                      </select>
                      {form.formState.errors.event_id?.message && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.event_id?.message}
                        </p>
                      )}
                      {eventExists === false && (
                        <p className="text-red-500 text-sm mt-1">
                          Evento não encontrado!
                        </p>
                      )}
                    </div>
                  )}
                />
                {eventExists === false && (
                  <p className="text-red-500 text-sm mt-1">
                    Evento não encontrado!
                  </p>
                )}
              </div>
              <div className="disabled">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItemField
                      field={{
                        ...field,
                        value: "present",
                      }}
                      label="Status da presença"
                      error={form.formState.errors.status?.message}
                      type="select"
                      placeholder="present"
                    />
                  )}
                />
              </div>
            </div>
            <div className="p-4 border rounded-xl space-y-3">
              <div>
                <span className="font-bold">Informações Data</span>
              </div>
              <div className="disabled">
                <FormField
                  control={form.control}
                  name="check_out_date"
                  render={({ field }) => (
                    <FormItemField
                      field={{
                        ...field,
                        value: checkOutDate,
                      }}
                      label="Data de saída limite"
                      error={form.formState.errors.check_out_date?.message}
                      type="datetime-local"
                      step="1"
                      placeholder="Selecione data e hora de saída"
                    />
                  )}
                />
              </div>

              <div className="disabled">
                <FormField
                  control={form.control}
                  name="check_in_date"
                  render={({ field }) => (
                    <FormItemField
                      field={{
                        ...field,
                        value: defaultDateTime,
                      }}
                      label="Data Check In"
                      error={form.formState.errors.check_out_date?.message}
                      type="datetime-local"
                      step="1"
                      placeholder="Data Check In"
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="mt-4 w-full bg-sky-800 text-white rounded-xl p-2 disabled:bg-gray-400"
              disabled={eventExists === false || loading}
            >
              {loading ? "Verificando..." : "Confirmar Check-In"}
            </button>
          </div>
        </form>
      </Form>
    </>
  );
}
