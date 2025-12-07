"use client";

import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import CheckInForm from "../CheckInForm";
import CheckOutForm from "../CheckOutForm";
import {
  PresenceCreate,
  PresenceFormSchema,
  presenceSchema,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";

import { BadgeMinus } from "lucide-react";

import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import { Event } from "@/lib/schemas/event.schema";
import { Presence } from "@/lib/types";
import { getColumns } from "./ViewEventsTableColumns";
import {
  createPresenceWithGeolocation as createPresence,
  patchPresenceWithGeolocation as patchPresence,
} from "@/lib/utils/presenceWithGeolocation";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { eventService } from "@/api/services/event.service";
import { presenceService } from "@/api/services/presence.service";
import { ApiError } from "@/api/errors/ApiError";

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export function ViewEventsDataTable() {
  const [data, setData] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [presencesRegistered, setPresencesRegistered] = useState<Presence[]>(
    []
  );
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});
  const [eventIdsFromPresences, setEventIdsFromPresences] = useState<string[]>(
    []
  );
  const [eventIdsFromPresencesRegistered, setEventIdsFromPresencesRegistered] =
    useState<string[]>([]);
  const { user } = useAuth();
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchEvents = async (data: Pagination) => {
    try {
      const response = await eventService.getAll({
        limit: data.pageSize,
        offset: data.pageIndex * data.pageSize,
      });

      setData(response);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("Não foi possível carregar os eventos.");
    }
  };

  const handleSubscribe = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;

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

        await createPresence(payload);

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

  const form = useForm<PresenceFormSchema>({
    resolver: zodResolver(presenceSchema),
    defaultValues: {
      event_id: "",
      status: "present",
      check_out_date: "",
      check_in_date: "",
    },
  });

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

      await patchPresence(presenceId, data, coordinates);

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

    const result = await patchPresence(presenceId, data, coordinates);

    if (!result) {
      setError("Ocorreu um erro ao cadastrar a presença");
      return;
    }

    setSuccess("Presença Atualizada com sucesso!");
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

  useEffect(() => {
    fetchEvents(pagination);
  }, [pagination, pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo(() => getColumns(), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    pageCount: Math.ceil(data.length / pagination.pageSize),
  });

  const handleFilterClick = (status: string) => {
    setActiveFilter(status);
    table.getColumn("status")?.setFilterValue(status);
  };

  const registeredEvents = data.filter((event) =>
    eventIdsFromPresencesRegistered.includes(event.id)
  );

  const presentEvents = data.filter((event) =>
    eventIdsFromPresences.includes(event.id)
  );

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SearchBar
          placeholder="Pesquisar eventos"
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        <div className="flex flex-col xl:flex-row justify-between xl:items-center w-full space-y-4">
          <div className="flex flex-col gap-1 md:flex-row max-md:w-full">
            <Button
              variant="outline"
              size="sm"
              className={`border rounded-xl ${activeFilter === "" && "bg-neutral-300"
                }`}
              onClick={() => handleFilterClick("")}
            >
              Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick("upcoming")}
              className={`border rounded-xl ${activeFilter === "upcoming" && "bg-neutral-300"
                }`}
            >
              Próximo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick("started")}
              className={`border rounded-xl ${activeFilter === "started" && "bg-neutral-300"
                }`}
            >
              Em andamento
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick("ended")}
              className={`border rounded-xl ${activeFilter === "ended" && "bg-neutral-300"
                }`}
            >
              Encerrado
            </Button>
          </div>

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
        </div>
      </div>
      <div className="w-full mb-3 mt-2 bg-sky-50 border rounded-xl h-fit-content flex items-center space-x-1 px-2">
        <BadgeMinus />
        <div className="text-left text-neutral-600 p-2 ">
          Selecionados ({table.getFilteredSelectedRowModel().rows.length})
        </div>
      </div>

      <DataTable table={table} />
    </div>
  );
}
