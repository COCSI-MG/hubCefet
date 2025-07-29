import PageHeader from "@/components/PageHeader";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent } from "@/api/data/events.data";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import EventsForm from "@/components/events/EventsForm";
import { EventCreate, EventCreateSchema, createEventSchema } from "@/lib/types";

export default function EventsCreate() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<EventCreateSchema>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      status: "upcoming",
      eventStartDate: "",
      eventEndDate: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit: SubmitHandler<EventCreateSchema> = async (
    data: EventCreate,
  ) => {
    const result = await createEvent({ ...data });
    if (!result) {
      setError("Ocorre um erro ao criar um evento, tente novamente");
      return;
    }
    setSuccess("Evento criado com sucesso");
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 10000);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(null);
      }, 10000);
    }
  }, [success]);

  return (
    <div>
      <PageHeader
        title="Voce está criando um evento"
        description="Clique em confirmar no final da criação para que as informações sejam salvas. Logo após, você poderá visualizar o evento na lista de eventos."
      />
      <div className="w-1/2 p-6 space-y-4 max-sm:w-full">
        <h1 className="text-2xl text-sky-900 font-bold mb-2">Nome do Evento</h1>
        <span className="text-sky-800">
          <strong>Descricao do evento:</strong> Lorem ipsum, dolor sit amet
          consectetur adipisicing elit. Doloribus temporibus consequatur nostrum
          fuga ipsum vel, modi nesciunt hic provident quod praesentium eveniet
          sed earum doloremque quam error asperiores unde blanditiis.
        </span>
      </div>
      <div className="ml-6 mr-6 max-w-full p-6 border rounded-xl mb-4">
        {error && (
          <Alert variant="destructive" className="w-1/2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ah, não</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="bg-green-200 w-1/2">
            <AlertCircle className="h-4-w-4" />
            <AlertTitle>{success}</AlertTitle>
            <AlertDescription>
              Para editar ou visualizar seu evento vá para página de eventos
            </AlertDescription>
          </Alert>
        )}
        <EventsForm form={form} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
