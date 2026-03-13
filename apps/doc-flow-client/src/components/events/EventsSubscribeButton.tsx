import { ApiError } from "@/api/errors/ApiError";
import { eventService } from "@/api/services/event.service";
import { presenceService } from "@/api/services/presence.service";
import { Event } from "@/lib/schemas/event.schema";
import { PresenceCreate } from "@/lib/types";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface EventsSubscribeButtonProps {
  selectedRow: Row<Event>;
  userIsSubscribed: boolean;
}

export function EventsSubscribeButton({ selectedRow, userIsSubscribed }: EventsSubscribeButtonProps) {
  const handleSubscribe = async () => {

    const event = selectedRow.original;

    if (event.vacancies <= 0) {
      toast.error(`Vagas encerradas no evento ${event.name}`);
      return
    }

    const payload: PresenceCreate = {
      event_id: event.id,
    };

    try {
      await eventService.decreaseVacances(event.id);

      await presenceService.create(payload);

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

  };

  return (
    <Button
      variant="secondary"
      className="rounded-2xl bg-sky-800 text-white hover:bg-sky-600"
      onClick={handleSubscribe}
      size='sm'
      disabled={userIsSubscribed}
    >
      Inscreva-se
    </Button>
  )
}
