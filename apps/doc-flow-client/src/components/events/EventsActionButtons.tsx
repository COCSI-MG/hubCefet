import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import CheckInForm from "../CheckInForm";
import CheckOutForm from "../CheckOutForm";
import { Event, Presence, PresenceCreate, PresenceFormSchema, presenceSchema, UserPayload } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { presenceService } from '@/api/services/presence.service';
import { toast } from 'sonner';
import { ApiError } from '@/api/errors/ApiError';
import { Row } from '@tanstack/react-table';
import { eventService } from '@/api/services/event.service';

interface EventsActionButtonsProps {
  user: UserPayload | null;
  events: Event[];
  success: string | null;
  selectedRows: Row<Event>[];
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function EventsActionButtons({ user, events, success, selectedRows, setError, setSuccess }: EventsActionButtonsProps) {
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [presencesRegistered, setPresencesRegistered] = useState<Presence[]>([]);
  const [eventIdsFromPresences, setEventIdsFromPresences] = useState<string[]>([]);
  const [eventIdsFromPresencesRegistered, setEventIdsFromPresencesRegistered] =
    useState<string[]>([]);

  const form = useForm<PresenceFormSchema>({
    resolver: zodResolver(presenceSchema),
    defaultValues: {
      event_id: "",
      status: "present",
      check_out_date: "",
      check_in_date: "",
    },
  });

  const fetchUserPresences = async () => {
    if (!user?.sub) return;

    try {
      const response = await presenceService.getAllByUser({
        id: user?.sub,
        offset: 0,
        limit: 10,
      });

      const { presences } = response;

      if (presences) {

        setPresences(presences);

        const filteredEventIds = presences
          .filter((presence) => presence.status === "present")
          .map((presence) => presence.event_id);

        setEventIdsFromPresences(filteredEventIds);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
        return
      }

      toast.error("Nao foi possivel visualizar eventos")

      setPresences([]);
      setEventIdsFromPresences([]);
    }
  };


  const fetchUserPresencesRegistered = async () => {
    if (!user?.sub) return;

    try {
      const response = await presenceService.getAllByUser({
        id: user?.sub,
        offset: 0,
        limit: 10,
      });

      const { presences } = response;

      if (presences) {
        setPresencesRegistered(presences);

        const filteredEventIds = presences
          .filter((presence) => presence.status === "registered")
          .map((presence) => presence.event_id);

        setEventIdsFromPresencesRegistered(filteredEventIds);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
        return
      }

      toast.error("Nao foi possivel visualizar eventos")

      setPresencesRegistered([]);
      setEventIdsFromPresencesRegistered([]);
    }
  };

  const handleSubscribe = async () => {
    if (selectedRows.length === 0) {
      toast.error("Nenhum evento selecionado para inscrição.");
      return;
    }

    const newEvents = selectedRows.filter(
      (row) => !eventIdsFromPresences.includes(row.original.id)
    );

    if (newEvents.length === 0) {
      toast.error("Você já está inscrito em todos os eventos selecionados.");
      return;
    }

    for (const row of newEvents) {
      const event = row.original;

      if (event.vacancies <= 0) {
        toast.error(`Vagas encerradas no evento ${event.name}`);
        continue;
      }

      const payload: PresenceCreate = {
        event_id: event.id,
        status: "registered",
        check_out_date: "",
        check_in_date: "",
      };

      try {
        await eventService.patch(event.id, {
          name: event.name,
          eventStartDate: event.start_at,
          eventEndDate: event.end_at,
          status: event.status,
          latitude: event.latitude,
          longitude: event.longitude,
          vacancies: event.vacancies - 1,
        });

        await presenceService.create({ ...payload });

        toast.success(
          `Inscrito com sucesso! Agora você pode fazer check-in no evento ${event.name}.`
        );
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(err.message);
          return
        }

        toast.error("Erro inesperado ao realizar inscrição.");
      }
    }
  };

  const registeredEvents = events.filter((event) =>
    eventIdsFromPresencesRegistered.includes(event.id)
  );

  const presentEvents = events.filter((event) =>
    eventIdsFromPresences.includes(event.id)
  );

  const onSubmit = async (
    data: PresenceCreate,
    coordinates?: { latitude: number; longitude: number }
  ) => {
    try {

      const eventIdFromForm = form.getValues("event_id");

      const presence = presencesRegistered.find(
        (p) => p.event_id === eventIdFromForm
      );

      if (!presence) {
        setError("Nenhuma presença encontrada para o evento selecionado.");
        return;
      }

      const presenceId = presence.id;

      await presenceService.patch(presenceId, data, coordinates);

      setSuccess("Presença Criada com sucesso!");

    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }

      console.error("Erro inesperado ao criar presença:", err);
      setError("Erro interno no servidor, tente novamente.");
    }
  };

  const onSubmitUpdate = async (
    data: PresenceCreate,
    coordinates?: { latitude: number; longitude: number }
  ) => {
    const eventIdFromForm = form.getValues("event_id");

    const presence = presences.find((p) => p.event_id === eventIdFromForm);

    if (!presence) {
      console.error(
        "Nenhuma presença encontrada com o selectedEventId:",
        eventIdFromForm
      );
      setError("Nenhuma presença encontrada para o evento selecionado.");
      return;
    }

    const presenceId = presence.id;

    const result = await presenceService.patch(presenceId, data, coordinates);

    if (!result) {
      setError("Ocorreu um erro ao cadastrar a presença");
      return;
    }

    setSuccess("Presença Atualizada com sucesso!");
  };

  useEffect(() => {
    if (openCheckOut) {
      form.reset();
      fetchUserPresences();
    } else {
      form.reset();
    }
  }, [openCheckOut]);

  useEffect(() => {
    if (openCheckIn) {
      form.reset();
      fetchUserPresencesRegistered();
    } else {
      form.reset();
    }
  }, [openCheckIn]);

  return (
    <div className="flex flex-col gap-1 md:flex-row ">
      <Dialog.Root open={openCheckOut} onOpenChange={setOpenCheckOut}>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl bg-red-600 text-white"
          >
            Faça o seu Check-Out
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
            <Dialog.Title className="text-xl font-bold">
              Check-Out
            </Dialog.Title>
            <Dialog.Description className="text-gray-600">
              Insira seus dados para confirmar o check-out.
            </Dialog.Description>

            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md mb-3">
                {success}
              </div>
            )}

            <CheckOutForm
              form={form}
              onSubmit={onSubmitUpdate}
              events={presentEvents}
              presences={presences}
            />

            <Dialog.Close asChild>
              <button className="absolute top-2 right-2 text-gray-600">
                ✖
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={openCheckIn} onOpenChange={setOpenCheckIn}>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl bg-sky-800 text-white"
          >
            Faça o seu Check-In
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
            <Dialog.Title className="text-xl font-bold">
              Check-In
            </Dialog.Title>
            <Dialog.Description className="text-gray-600">
              Insira seus dados para confirmar o check-in.
            </Dialog.Description>

            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md mb-3">
                {success}
              </div>
            )}

            <CheckInForm
              form={form}
              onSubmit={onSubmit}
              events={registeredEvents}
            />

            <Dialog.Close asChild>
              <button className="absolute top-2 right-2 text-gray-600">
                ✖
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Button
        type="button"
        variant="outline"
        className="rounded-xl bg-sky-800 text-white"
        onClick={handleSubscribe}
      >
        Inscreva-se
      </Button>
    </div>
  )
}
