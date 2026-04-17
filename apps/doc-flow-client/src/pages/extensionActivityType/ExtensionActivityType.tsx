import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pagination as PaginationArgs } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { GetExtensionActivityTypeColumns } from "@/components/extensionActivityType/ExtensionActivityTypeColumns";
import { ExtensionActivityType, extensionActivityTypeService, ExtensionActivityTypeWithTotal } from "@/api/services/extension-activity-type.service";
import { CreateExtensionActivityTypeDialog } from "@/components/extensionActivityType/CreateExtensionActivityTypeDialog";
import { UpdateExtensionActivityTypeDialog } from "@/components/extensionActivityType/UpdateExtensionActivityTypeDialog";
import { DeleteExtensionActivityTypeDialog } from "@/components/extensionActivityType/DeleteExtensionActivityTypeDialog";
import { ApiError } from "@/api/errors/ApiError";

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export function ExtensionActivityTypeManagement() {
  const [extensionActivity, setExtensionActivity] = useState<ExtensionActivityTypeWithTotal>({
    rows: [],
    count: 0
  })
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ExtensionActivityType | null>(null)

  const [itemToUpdate, setItemToUpdate] = useState<ExtensionActivityType | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)

  const fetchExtensionActivityTypes = async (pagination: PaginationArgs) => {
    try {
      const response = await extensionActivityTypeService.findAll(pagination)
      setExtensionActivity(response)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error('Nao foi possivel carregar os tipos de atividades de extensão')
    }
  }

  useEffect(() => {
    fetchExtensionActivityTypes({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    })
  }, [pagination.pageIndex, pagination.pageSize]);


  const openUpdateModal = (item: ExtensionActivityType) => {
    setItemToUpdate(item);
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (item: ExtensionActivityType) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const table = useReactTable({
    columns: GetExtensionActivityTypeColumns(openUpdateModal, openDeleteModal),
    data: extensionActivity.rows,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    getFacetedRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      pagination,
    },
    pageCount: Math.ceil(extensionActivity.count / pagination.pageSize)
  })

  return (
    <>
      <PageHeader
        title="Gerenciamento dos tipos de atividades de extensão"
        description="Cadastre, visualize, atualize e remova os tipos de atividades de extensão"
      />

      <div className="container max-w-full flex flex-col gap-6 p-6 h-fit ">
        <CreateExtensionActivityTypeDialog
          fetchExtensionActivityTypes={fetchExtensionActivityTypes}
          pagination={pagination}
        />

        <UpdateExtensionActivityTypeDialog
          fetchExtensionActivityTypes={fetchExtensionActivityTypes}
          pagination={pagination}
          setIsModalOpen={setIsUpdateModalOpen}
          isModalOpen={isUpdateModalOpen}
          item={itemToUpdate}
          setItem={setItemToUpdate}
        />

        <DeleteExtensionActivityTypeDialog
          fetchExtensionActivityTypes={fetchExtensionActivityTypes}
          pagination={pagination}
          setIsModalOpen={setIsDeleteModalOpen}
          isModalOpen={isDeleteModalOpen}
          item={itemToDelete}
          setItem={setItemToDelete}
        />

        <SearchBar
          placeholder="Pesquisar arquivos"
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />

        <DataTable table={table} />
      </div >
    </>
  )
}
