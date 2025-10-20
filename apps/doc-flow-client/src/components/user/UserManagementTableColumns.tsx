import { Checkbox } from "@/components/ui/checkbox";
import { components } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Profile } from "@/lib/enum/profile.enum";

type User = components["schemas"]["User"];

export function getUserColumns(
  onRefresh: () => void,
  navigate: (path: string) => void,
  profiles: { id: string; name: string }[] = []
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
        const user = row.original;
        const profile = profiles.find((p) => p.id === user.profile_id);

        if (!profile) {
          return (
            <span className="text-sm text-gray-400 italic">Sem perfil</span>
          );
        }

        const profileStyle = (() => {
          switch (profile.name as Profile) {
            case Profile.Admin:
              return 'bg-red-100 text-red-800';
            case Profile.Professor:
              return 'bg-purple-100 text-purple-800';
            case Profile.Student:
              return 'bg-green-100 text-green-800';
            case Profile.User:
              return 'bg-sky-100 text-sky-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        })();

        const displayName = (() => {
          switch (profile.name as Profile) {
            case Profile.Admin:
              return 'Admin';
            case Profile.Professor:
              return 'Professor';
            case Profile.Student:
              return 'Estudante';
            case Profile.User:
              return 'Usuário';
            default:
              return profile.name;
          }
        })();

        return (
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${profileStyle}`}
          >
            {displayName}
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
