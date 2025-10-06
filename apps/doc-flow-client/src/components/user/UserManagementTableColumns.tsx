import { Checkbox } from "@/components/ui/checkbox";
import { components } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

type User = components["schemas"]["User"];

export function getUserColumns(
  onRefresh: () => void,
  navigate: (path: string) => void
): ColumnDef<User>[] {
  return [
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
            aria-label="Selecionar todos"
          />
        );
      },
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <span className="font-mono text-xs text-gray-600">
            {id.substring(0, 8)}...
          </span>
        );
      },
    },
    {
      accessorKey: "full_name",
      header: "Nome Completo",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.full_name}
              />
              <AvatarFallback className="text-xs">
                {user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.full_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-gray-600">{row.original.email}</span>
        );
      },
    },
    {
      accessorKey: "enrollment",
      header: "Matrícula",
      cell: ({ row }) => {
        return (
          <span className="font-mono text-sm">{row.original.enrollment}</span>
        );
      },
    },
    {
      accessorKey: "profile_id",
      header: "Perfil",
      cell: ({ row }) => {
        // You might want to fetch profile names and cache them
        // For now, just show the profile ID
        return (
          <span className="text-sm">
            {row.original.profile_id
              ? row.original.profile_id.substring(0, 8) + "..."
              : "Sem perfil"}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Data de Criação",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString("pt-BR")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const user = row.original;

        const handleDelete = async () => {
          const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir o usuário "${user.full_name}"? Esta ação não pode ser desfeita.`
          );

          if (!confirmDelete) return;

          try {
            // Here you would call your delete API
            // await deleteUser(user.id);
            toast.success("Usuário excluído com sucesso");
            onRefresh();
          } catch (err) {
            console.error("Error deleting user:", err);
            toast.error("Erro ao excluir usuário");
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                navigate(`/horarios/gerenciar/usuarios/editar/${user.id}`)
              }
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
