import { Checkbox } from "@/components/ui/checkbox";
import { Event } from "@/lib/schemas/event.schema";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { tableEventType } from "./EventsTable";
import { EventsActionButtons } from "./EventsActionButtons";
import { EventScannerModal } from "./EventScannerModal";

export function getColumns(
	{ navigate }: { navigate: (path: string) => void },
	openDeleteModal: (item: Event) => void,
	tableType: tableEventType,
	isAdmin: boolean,
	isProfessor: boolean,
	userId: string,
	isMyEventsPage: boolean
): ColumnDef<Event>[] {

  const columns: ColumnDef<Event>[] = [
    {
      id: "select",
      header: ({ table }) => {
        return (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              table.getIsSomePageRowsSelected()
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all rows"
          />
        );
      },
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
    },
  ]

  if (tableType === "all") {
    columns.push(
      {
        accessorKey: "user",
        header: "Criado Por",
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <Avatar>
                <AvatarImage
                  src={row.original.user?.full_name.charAt(0).toLowerCase() || ""}
                  alt={row.original.user?.full_name}
                />
                <AvatarFallback className="rounded-lg">
                  {row.original.user?.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2">{row.original.user?.full_name}</span>
            </div>
          );
        },
      },
    )
  }

  columns.push(
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        switch (status) {
          case "started":
            return <span>Em andamento</span>;
          case "ended":
            return <span>Encerrado</span>;
          case "upcoming":
            return <span>Próximo</span>;
        }
      },
    },
    {
      accessorKey: "start_at",
      header: "Data de início",
      cell: ({ row }) => {
        if (!row.original.start_at) {
          return <span>Não definido</span>;
        }
        const date = new Date(row.original.start_at);
        const dateFormated = date.toLocaleString("pt-BR");
        return <span>{dateFormated}</span>;
      },
    },
    {
      accessorKey: "end_at",
      header: "Data de término",
      cell: ({ row }) => {
        if (!row.original.end_at) {
          return <span>Não definido</span>;
        }
        const date = new Date(row.original.end_at);
        const dateFormated = date.toLocaleString("pt-BR");
        return <span>{dateFormated}</span>;
      },
    },
    {
      accessorKey: "vacancies",
      header: "Vagas",
      cell: ({ row }) => {
        const vacancies = row.original.vacancies;
        return <span>{vacancies ?? "0"}</span>;
      },
    },

    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original
        const canEditOrDelete = isAdmin || (tableType === 'user' && isProfessor)
        const eventAlreadyStarted = item.status === 'started'

        return (
          <div className="flex justify-start items-center gap-2">
            <Button
              className="rounded-2xl bg-blue-700 text-white hover:bg-blue-500"
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/events/${item.id}`)}
            >
              Visualizar
            </Button>

            {canEditOrDelete && (
              <>
                <Button
                  className="rounded-2xl bg-sky-900 text-white hover:bg-sky-700"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/events/${item.id}/edit`)}
                  disabled={new Date(item.end_at) < new Date()}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-2xl"
                  size="sm"
                  onClick={() => openDeleteModal(item)}
                  disabled={new Date(item.start_at) < new Date()}
                >
                  Excluir
                </Button>


                {item.presence_option === 'qrcode' && (
                  <EventScannerModal eventId={item.id} eventStatus={item.status} eventAlreadyStarted={eventAlreadyStarted} />
                )}
              </>
            )}

            {!isAdmin && !isProfessor && (
              <EventsActionButtons userId={userId} selectedRow={row} isMyEventsPage={isMyEventsPage} eventAlreadyStarted={eventAlreadyStarted} />
            )}

          </div>
        )
      },
    }
  )
  return columns;
}
