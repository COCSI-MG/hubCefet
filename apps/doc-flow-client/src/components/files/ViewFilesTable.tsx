"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "../ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import { getColumns } from "./ViewFileTableColumns";
import { File } from "@/lib/schemas/file.schema";
import { getFilesByUser } from "@/api/data/file.data";
import { Pagination as PaginationArgs } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Filter } from "lucide-react";

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export function ViewFilesTable() {
  const [data, setData] = useState<File[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchEvents = async (data: PaginationArgs) => {
    const files = await getFilesByUser({ ...data });
    if (!files) {
      return;
    }
    setData(files);
  };

  const onDelete = useCallback(() => {
    fetchEvents({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });
  }, [pagination]);

  useEffect(() => {
    fetchEvents({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });
  }, [pagination, pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo(() => getColumns({ onDelete }), [onDelete]);

  const table = useReactTable({
    data,
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
    pageCount: Math.ceil(data.length / pagination.pageSize),
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
      <div className="flex flex-row justify-between items-center w-full space-y-4">
        <div className="space-x-1">
          <Button
            variant="outline"
            size="sm"
            className={`border rounded-xl ${
              sorting.length === 0 && "bg-neutral-300"
            }`}
            onClick={() => handleSorting("")}
          >
            Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSorting("creator")}
            className={`border rounded-xl ${
              table.getColumn("user")?.getIsSorted() && "bg-neutral-300"
            }`}
          >
            Responsável
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSorting("time")}
            className={`border rounded-xl ${
              table.getColumn("created_at")?.getIsSorted() && "bg-neutral-300"
            }`}
          >
            Por tempo de criação
          </Button>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"outline"}
                size={"lg"}
                className="rounded-2xl bg-neutral-100 text-sky-700"
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

      <DataTable table={table} />
    </div>
  );
}
