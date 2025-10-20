import { Form, FormField } from "@/components/ui/form";
import { PresenceFormSchema, Presence } from "@/lib/types";
import FormItemField from "./FormItemField";
import { UseFormReturn } from "react-hook-form";
import { getEvent } from "@/api/data/events.data";
import { useState, useEffect } from "react";
import { Event } from "@/lib/types";
import { toast } from "sonner";
import { getCurrentPosition } from "@/lib/utils/geolocation";

interface PresenceFormCheckouProps {
  form: UseFormReturn<PresenceFormSchema>;
  onSubmit: (
    data: PresenceFormSchema,
    coordinates?: { latitude: number; longitude: number }
  ) => void;
  events: Event[];
  presences: Presence[];
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
  return distance <= radius;
}

export default function PresencesForm({
  form,
  onSubmit,
  events,
  presences,
}: PresenceFormCheckouProps) {
  const [eventExists, setEventExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string>("");

  const handleCheckOut = async (data: PresenceFormSchema) => {
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

      console.log("🌍 LOCALIZAÇÃO DO USUÁRIO (CHECK-OUT):");
      console.log(`📍 Latitude: ${latitude}`);
      console.log(`📍 Longitude: ${longitude}`);
      console.log(
        `🎯 Localização do evento - Lat: ${event.latitude}, Lng: ${event.longitude}`
      );

      if (isWithinRange(latitude, longitude, event.latitude, event.longitude)) {
        onSubmit(data, { latitude, longitude });
      } else {
        toast.error(
          "Você não está dentro da área do evento para realizar o check-out.",
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Erro ao obter sua localização. Verifique se a geolocalização está habilitada.",
        { duration: 5000 }
      );
    }
  };

  const validateEventId = async (eventId: string) => {
    if (!eventId) return;

    setLoading(true);
    try {
      const event = await getEvent(eventId);

      if (event != null) {
        setEvent(event);
        setEventExists(true);
      } else {
        setEvent(null);
        setEventExists(false);
      }
    } catch (error) {
      if (error) setEvent(null);
      setEventExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    setCheckOutDate(localDateTime);
  }, [event]);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (event) {
      form.setValue("event_id", event.id);
      setEventExists(true);
      setEvent(event);
      const presence = presences.find((p) => p.event_id === event.id);
      if (presence && presence.check_in_date) {
        const datePresence = formatDateForInput(presence.check_in_date);
        setCheckInDate(datePresence);
      } else {
        setCheckInDate("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  useEffect(() => {
    if (checkOutDate) {
      form.setValue("check_out_date", checkOutDate);
    }
  }, [checkOutDate, form]);

  useEffect(() => {
    if (checkInDate) {
      form.setValue("check_in_date", checkInDate);
    }
  }, [checkInDate, form]);

  useEffect(() => {
    form.setValue("status", "registered");
  }, [form]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCheckOut)}>
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
              <div className="hidden">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItemField
                      field={{
                        ...field,
                        value: "registered",
                      }}
                      label="Status da presença"
                      error={form.formState.errors.status?.message}
                      type="select"
                      placeholder="registered"
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
                        onChange: (e) => {
                          setCheckOutDate(e.target.value);
                          field.onChange(e.target.value);
                        },
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
                        value: field.value || checkInDate,
                        onChange: (e) => {
                          setCheckInDate(e.target.value);
                          field.onChange(e.target.value);
                        },
                      }}
                      label="Data Check In"
                      error={form.formState.errors.check_in_date?.message}
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
              {loading ? "Verificando..." : "Confirmar Check-Out"}
            </button>
          </div>
        </form>
      </Form>
    </>
  );
}
