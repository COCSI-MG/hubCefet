import PageHeader from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import EventsForm from "@/components/events/EventsForm";
import { EventCreate, EventCreateSchema, createEventSchema } from "@/lib/types";
import { eventService } from "@/api/services/event.service";
import { ApiError } from "@/api/errors/ApiError";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function EventsCreate() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()

  const form = useForm<EventCreateSchema>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "upcoming",
      start_at: "",
      end_at: "",
      latitude: 0,
      longitude: 0,
      radius: 10,
    },
  });

  async function onSubmit(data: EventCreate) {
    try {
      await eventService.create({ ...data });

      toast.success("Evento criado com sucesso");
      navigate('/events/user')
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        return;
      }

      setError("Erro inesperado ao criar evento.");
    }
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 10000);
    }
  }, [error]);

  return (
    <div>
      <PageHeader
        title="Voce está criando um evento"
        description="Clique em confirmar no final da criação para que as informações sejam salvas. Logo após, você poderá visualizar o evento na lista de eventos."
      />
      <div className="ml-6 mr-6 max-w-full p-6 border rounded-xl mb-4 mt-5">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ah, não</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <EventsForm form={form} onSubmit={onSubmit} mode="create" />
      </div>
    </div>
  );
}
