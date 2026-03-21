import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { BadgeMinus } from "lucide-react";
import { Button } from "../ui/button";
import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import { Event } from "@/lib/schemas/event.schema";
import { getColumns } from "./EventsTableColumns";
import useAuth from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { Pagination as PaginationArgs } from "@/lib/types";
import { Pagination } from "@/pages/events/AllEventsView";

export type tableEventType = 'user' | 'all'

interface EventsDataTableProps {
  events: Event[]
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>
  pagination: Pagination;
  fetchEvents: (pagination: PaginationArgs) => Promise<void>;
  tableType: tableEventType;
}

export function EventsDataTable({ events, setPagination, pagination, fetchEvents, tableType }: EventsDataTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});
  const { user, token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Event | null>(null)
  const navigate = useNavigate();
  const location = useLocation();

  const isMyEventsPage = location.pathname === "/events/user";

  const getUserProfile = () => {
    if (!user || !token) {
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold">
        Carregando...
      </div>
    }

    if (token) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded: any = jwtDecode(token);

      let profileName = "";
      if (typeof decoded.profile === "string") {
        profileName = decoded.profile;
      } else if (decoded.profile?.name) {
        profileName = decoded.profile.name;
      } else if (
        decoded.profile?.roles &&
        decoded.profile.roles.length > 0
      ) {
        profileName = decoded.profile.roles[0];
      }

      const profileLower = profileName.toLowerCase();

      setIsAdmin(
        profileLower === "admin" || profileLower === "coordinator"
      );
      setIsProfessor(profileLower === "professor");
    }
  };

  const openDeleteModal = (item: Event) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    getUserProfile();
  }, [token, user]);

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


  const columns = useMemo(
    () => getColumns(
      { navigate },
      openDeleteModal,
      tableType,
      isAdmin,
      isProfessor,
      user!.sub,
      isMyEventsPage
    ),
    [openDeleteModal, tableType, isAdmin, isProfessor, user, isMyEventsPage]
  );

  const table = useReactTable({
    data: events,
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
    pageCount: Math.ceil(events.length / pagination.pageSize),
  });

  const handleFilterClick = (status: string) => {
    setActiveFilter(status);
    table.getColumn("status")?.setFilterValue(status);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SearchBar
          placeholder="Pesquisar eventos"
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />

        <DeleteEventDialog
          fetchEvent={fetchEvents}
          pagination={pagination}
          setIsModalOpen={setIsDeleteModalOpen}
          isModalOpen={isDeleteModalOpen}
          item={itemToDelete}
          setItem={setItemToDelete}
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
