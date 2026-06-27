import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import DataTablePagination from "../DataTablePagination";
import { getColumns } from "./ViewFileTableColumns";
import { File } from "@/lib/schemas/file.schema";
import { fileService } from "@/api/services/files.service";
import { Pagination as PaginationArgs } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CalendarDays, FileText, Filter } from "lucide-react";
import { ApiError } from "@/api/errors/ApiError";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import ActionsTableColumn from "./ActionsTableColumn";

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

const fileTypeLabels: Record<File["type"], string> = {
  certificate: "Certificado",
  document: "Documento",
  image: "Imagem",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ViewFilesTable() {
  const [files, setFiles] = useState<File[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchEvents = async (data: PaginationArgs) => {
    try {
      const files = await fileService.getAllByUser({ ...data });

      setFiles(files);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Erro ao visualizar arquivos");
    }
  };

  useEffect(() => {
    fetchEvents({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });
  }, [pagination, pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo(() => getColumns(), []);

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility,
      rowSelection,
      pagination,
      sorting,
    },
    pageCount: Math.ceil(files.length / pagination.pageSize),
  });

  const handleSorting = (target: "creator" | "time" | "") => {
    switch (target) {
      case "creator":
        table
          .getColumn("user")
          ?.toggleSorting(table.getColumn("user")?.getIsSorted() === "asc");
        break;
      case "time":
        table
          .getColumn("created_at")
          ?.toggleSorting(
            table.getColumn("created_at")?.getIsSorted() === "asc"
          );
        break;
      default:
        setSorting([]);
        break;
    }
  };

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Pesquisar arquivos"
        onChange={(e) => table.setGlobalFilter(e.target.value)}
      />
      <div className="flex flex-col md:flex-row justify-between md:items-center w-full space-y-4">
        <div className="flex flex-col gap-1 md:flex-row max-md:w-full">
          <Button
            variant="outline"
            size="sm"
            className={`border rounded-xl ${sorting.length === 0 && "bg-neutral-300"
              }`}
            onClick={() => handleSorting("")}
          >
            Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSorting("creator")}
            className={`border rounded-xl ${table.getColumn("user")?.getIsSorted() && "bg-neutral-300"
              }`}
          >
            Responsável
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSorting("time")}
            className={`border rounded-xl ${table.getColumn("created_at")?.getIsSorted() && "bg-neutral-300"
              }`}
          >
            Por tempo de criação
          </Button>
        </div>

        <div className="max-md:w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"outline"}
                size={"lg"}
                className="rounded-2xl bg-neutral-100 text-sky-700 max-md:w-full"
              >
                <Filter />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.columnDef?.header?.toString()}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const file = row.original;

            return (
              <Card key={row.id} className="transition-colors hover:bg-sky-50">
                <CardHeader>
                  <CardTitle className="min-w-0 text-neutral-800">
                    <span className="block truncate">{file.name}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <dl className="space-y-1.5 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-sky-700" />
                      <dt className="sr-only">Tipo de arquivo</dt>
                      <dd>{fileTypeLabels[file.type] ?? file.type}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-sky-700" />
                      <dt className="sr-only">Data de criação</dt>
                      <dd>{formatDateTime(file.created_at)}</dd>
                    </div>
                  </dl>
                </CardContent>

                <CardFooter className="flex-wrap gap-2 border-t pt-3">
                  <ActionsTableColumn fileId={file.id} />
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <Card className="py-10 text-center text-sm text-neutral-500">
            Nenhum arquivo encontrado.
          </Card>
        )}

        <DataTablePagination table={table} />
      </div>

      <div className="hidden md:block">
        <DataTable table={table} />
      </div>
    </div>
  );
}
