import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { User } from "@/lib/schemas/user.schema";
import UserEditDialogAdmin from "./UserEditDialogAdmin";
import { Button } from "../ui/button";

export const GetUserColumns = (
  openResetPasswordModal: (item: User) => void,
  onRefresh?: () => void
): ColumnDef<User>[] => {
  return [
    {
      accessorKey: "full_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "enrollment",
      header: "Matrícula",
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="flex gap-2">
            <UserEditDialogAdmin user={item as any} onSuccess={onRefresh}>
              <Button className="bg-orange-400 hover:bg-orange-500 text-white rounded-2xl">
                Atualizar
              </Button>
            </UserEditDialogAdmin>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl"
              onClick={() => openResetPasswordModal(item)}
            >
              Resetar Senha
            </Button>
          </div >
        );
      },
    },
  ];
};
