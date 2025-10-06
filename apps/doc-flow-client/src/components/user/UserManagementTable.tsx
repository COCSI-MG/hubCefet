"use client";

import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import { deleteUsers, getAllUsers } from "@/api/data/users.data";
import { components } from "@/lib/schema";
import { getUserColumns } from "./UserManagementTableColumns";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type User = components["schemas"]["User"];

export function UserManagementDataTable() {
  const [data, setData] = useState<User[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      if (!users) {
        toast.error("Erro ao carregar usuários");
        return;
      }
      setData(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Erro ao carregar usuários");
    }
  };

  const handleDeleteSelected = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;

    if (selectedRows.length === 0) {
      toast.error("Nenhum usuário selecionado para exclusão.");
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir ${selectedRows.length} usuário(s)? Esta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    try {
      await deleteUsers(selectedRows.map((row) => row.id));

      toast.success(
        `${selectedRows.length} usuário(s) excluído(s) com sucesso`
      );
      setRowSelection({});
      fetchUsers();
    } catch (err) {
      console.error("Error deleting users:", err);
      toast.error("Erro ao excluir usuários");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const table = useReactTable({
    data,
    columns: getUserColumns(fetchUsers, navigate),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SearchBar
            placeholder="Buscar usuários..."
            onChange={(e) => {
              // Handle search functionality here
              const value = e.target.value;
              table.getColumn("full_name")?.setFilterValue(value);
            }}
          />
        </div>

        <div className="flex items-center space-x-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir ({selectedCount})</span>
            </Button>
          )}

          <Button
            onClick={() => navigate("/horarios/gerenciar/usuarios/criar")}
            className="flex items-center space-x-1 bg-sky-900 hover:bg-sky-800"
          >
            <UserPlus className="h-4 w-4" />
            <span>Novo Usuário</span>
          </Button>
        </div>
      </div>

      <DataTable table={table} />

      {data.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>Total: {data.length} usuário(s)</div>
          {selectedCount > 0 && (
            <div>{selectedCount} usuário(s) selecionado(s)</div>
          )}
        </div>
      )}
    </div>
  );
}
