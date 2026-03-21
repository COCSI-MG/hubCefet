import { ApiError } from "@/api/errors/ApiError";
import { eventService } from "@/api/services/event.service";
import { EventMap } from "@/components/events/EventMap";
import { InfoCard } from "@/components/InfoCard";
import PageHeader from "@/components/PageHeader";
import { Event } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export function EventView() {
  const [event, setEvent] = useState<Event>()
  const { eventId } = useParams()

  async function fetchEvent() {
    if (!eventId) {
      toast.error('Evento nao encontrado, tente novamente')
      return
    }

    try {
      const response = await eventService.getOne(eventId)

      setEvent(response.event)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error('Nao foi possivel carregar o evento')
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [])

  const portugueseStatus = (() => {
    switch (event?.status) {
      case "started":
        return "em andamento";
      case "ended":
        return "encerrado";
      case "upcoming":
        return "próximo";
      default:
        return "desconhecido";
    }
  })();

  return (
    <>
      <PageHeader
        title="Visualizacao do Evento"
        description="Visualize as informacoes sobre o evento, de forma detalhada"
      />

      <div className="w-full h-96 rounded-xl p-6 mb-6">
        <h1 className="mb-4 text-3xl font-medium text-sky-900">
          Local do Evento
        </h1>
        <div className="w-full h-full rounded-xl border-2 border-neutral-200 shadow-md">
          {event && (
            <EventMap
              lat={event.latitude}
              long={event.longitude}
              radius={event.radius}
            />
          )}
        </div>
      </div>

      <div className="w-full rounded-xl p-6">
        <h1 className="mb-6 text-3xl font-medium text-sky-900">
          Informações do Evento
        </h1>

        {event && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <InfoCard data={event.name} label="Nome" />
            <InfoCard data={portugueseStatus} label="Status" />
            <InfoCard
              data={new Date(event.start_at).toLocaleString("pt-BR")}
              label="Início"
            />
            <InfoCard
              data={new Date(event.end_at).toLocaleString("pt-BR")}
              label="Término"
            />
            <InfoCard data={event.vacancies + ' Vagas'} label="Nome" />
            <InfoCard data={event.user.full_name} label="Criado por" />


            <div className="mt-6 lg:col-span-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-medium text-sky-900">
                  Descrição do Evento
                </span>
              </div>
              <div className="bg-sky-50 rounded-xl p-5 border-l-4 border-primary">
                <p className="text-sky-900 leading-relaxed font-medium">
                  {event.description}
                </p>
              </div>
            </div>

          </div>
        )}
      </div >
    </>
  )
}
