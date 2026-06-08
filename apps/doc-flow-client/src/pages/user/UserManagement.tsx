import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pagination as PaginationArgs } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { GetUserColumns } from "@/components/user/UserColumns";
import { userService } from "@/api/services/users.service";
import UserCreateDialog from "@/components/user/UserCreateDialog";
import { User } from "@/lib/schemas/user.schema";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/api/errors/ApiError";

import { ResetPasswordDialog } from "@/components/user/ResetPasswordDialog";

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [itemToReset, setItemToReset] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);


  const fetchUsers = async (paginationInfo: PaginationArgs, searchTerm?: string) => {
    try {
      const response = await userService.getAll({
        limit: paginationInfo.limit,
        offset: paginationInfo.offset,
        search: searchTerm,
      });
      setUsers(response.users || []);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error('Não foi possível carregar os usuários');
    }
  };

  useEffect(() => {
    fetchUsers({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });
  }, [pagination.pageIndex, pagination.pageSize]);


  const openResetPasswordModal = (item: User) => {
    setItemToReset(item);
    setIsResetModalOpen(true);
  };

  const table = useReactTable({
    columns: GetUserColumns(openResetPasswordModal, () => fetchUsers({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    })),
    data: users,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    manualPagination: true,
    state: {
      pagination,
    },
    pageCount: -1,
  });

  return (
    <>
      <PageHeader
        title="Gerenciamento de Usuários"
        description="Cadastre, visualize, atualize e resete a senha dos usuários do sistema"
      />

      <div className="container max-w-full flex flex-col gap-6 p-6 h-fit ">
        <div className="flex justify-end">
          <UserCreateDialog onSuccess={() => fetchUsers({
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
          })}>
            <Button className="bg-sky-900 hover:bg-sky-800 text-white rounded-2xl">
              Criar Novo Usuário
            </Button>
          </UserCreateDialog>
        </div>


        {isResetModalOpen && (
          <ResetPasswordDialog
            setIsModalOpen={setIsResetModalOpen}
            isModalOpen={isResetModalOpen}
            item={itemToReset}
            setItem={setItemToReset}
          />
        )}

        <SearchBar
          placeholder="Pesquisar usuários"
          onChange={(e) => {
            fetchUsers({
              limit: pagination.pageSize,
              offset: pagination.pageIndex * pagination.pageSize,
            }, e.target.value);
          }}
        />

        <DataTable table={table} />
      </div >
    </>
  );
}
