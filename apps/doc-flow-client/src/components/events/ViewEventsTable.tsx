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
import { getAllEvents } from "@/api/data/events.data";
import { Event } from "@/lib/schemas/event.schema";
import { Presence } from "@/lib/types";
import { getColumns } from "./ViewEventsTableColumns";
import { getUserPresences } from "@/api/data/presence.data";
import {
  createPresenceWithGeolocation as createPresence,
  patchPresenceWithGeolocation as patchPresence,
} from "@/lib/utils/presenceWithGeolocation";
import { patch } from "@/api/data/events.data";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

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
    const events = await getAllEvents({
      limit: data.pageSize,
      offset: data.pageIndex * data.pageSize,
    });
    if (!events) {
      return;
    }
    setData(events);
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
      const eventId = row.original.id;
      const valVacancies = row.original.vacancies;

      const payload: PresenceCreate = {
        event_id: eventId,
        status: "registered",
        check_out_date: "",
        check_in_date: "",
      };

      try {
        if (valVacancies > 0) {
          const result = await createPresence(payload);
          if (result) {
            toast.success(
              `Inscrições realizadas com sucesso! Agora você pode realizar check-ins no evento  ${row.original.name}.`
            );
            if (valVacancies > 0)
              patch(eventId, {
                name: row.original.name,
                eventStartDate: row.original.start_at,
                eventEndDate: row.original.end_at,
                status: row.original.status,
                latitude: row.original.latitude,
                longitude: row.original.longitude,
                vacancies: row.original.vacancies - 1,
              });
            toast.success(
              `Número de vacancies no evento ${row.original.name}: ${
                row.original.vacancies - 1
              }`
            );
          }
        } else {
          toast.error(`vacancies encerradas no evento ${row.original.name}`);
        }
      } catch (error) {
        console.error("Error while subscribing to event:", error);
      }
    }
  };

  const fetchUserPresences = async () => {
    if (!user?.sub) return;

    try {
      const response = await getUserPresences({
        id: user?.sub,
        offset: 0,
        limit: 10,
      });
      if (response && response.length > 0) {
        setPresences(response);

        const filteredEventIds = response
          .filter((presence) => presence.status === "present")
          .map((presence) => presence.event_id);

        setEventIdsFromPresences(filteredEventIds);
      } else {
        setPresences([]);
        setEventIdsFromPresences([]);
      }
    } catch (error) {
      console.error("Erro ao buscar presenças:", error);
      setPresences([]);
      setEventIdsFromPresences([]);
    }
  };

  const fetchUserPresencesRegistered = async () => {
    if (!user?.sub) return;

    try {
      const response = await getUserPresences({
        id: user?.sub,
        offset: 0,
        limit: 10,
      });

      if (response && response.length > 0) {
        setPresencesRegistered(response);

        const filteredEventIds = response
          .filter((presence) => presence.status === "registered")
          .map((presence) => presence.event_id);

        setEventIdsFromPresencesRegistered(filteredEventIds);
      } else {
        setPresencesRegistered([]);
        setEventIdsFromPresencesRegistered([]);
      }
    } catch (error) {
      console.error("Erro ao buscar presenças:", error);
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
    const eventIdFromForm = form.getValues("event_id");

    const presence = presencesRegistered.find(
      (p) => p.event_id === eventIdFromForm
    );

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

    setSuccess("Presença Criada com sucesso!");
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
      <SearchBar
        placeholder="Pesquisar eventos"
        onChange={(e) => table.setGlobalFilter(e.target.value)}
      />
      <div className="flex flex-row justify-between items-center w-full space-y-4">
        <div className="space-x-1">
          <Button
            variant="outline"
            size="sm"
            className={`border rounded-xl ${
              activeFilter === "" && "bg-neutral-300"
            }`}
            onClick={() => handleFilterClick("")}
          >
            Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterClick("upcoming")}
            className={`border rounded-xl ${
              activeFilter === "upcoming" && "bg-neutral-300"
            }`}
          >
            Próximo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterClick("started")}
            className={`border rounded-xl ${
              activeFilter === "started" && "bg-neutral-300"
            }`}
          >
            Em andamento
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterClick("ended")}
            className={`border rounded-xl ${
              activeFilter === "ended" && "bg-neutral-300"
            }`}
          >
            Encerrado
          </Button>
        </div>

        <div className="flex space-x-4">
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
