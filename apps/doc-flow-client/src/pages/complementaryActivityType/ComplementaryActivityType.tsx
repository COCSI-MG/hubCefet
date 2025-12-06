import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pagination as PaginationArgs } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { GetComplementaryActivityTypeColumns } from "@/components/complementaryActivityType/ComplementaryActivityTypeColumns";
import { ComplementaryActivityType, complementaryActivityTypeService, ComplementaryActivityTypeWithTotal } from "@/api/services/complementary-activity-type.service";
import { CreateActivityTypeDialog } from "@/components/complementaryActivityType/CreateActivityTypeDialog";
import { UpdateActivityTypeDialog } from "@/components/complementaryActivityType/UpdateActivityTypeDialog";
import { DeleteActivityTypeDialog } from "@/components/complementaryActivityType/DeleteActivityTypeDialog";

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export function ComplementaryActivityTypeManagement() {
  const [complementaryActivity, setComplementaryActivity] = useState<ComplementaryActivityTypeWithTotal>({
    rows: [],
    count: 0
  })
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ComplementaryActivityType | null>(null)

  const [itemToUpdate, setItemToUpdate] = useState<ComplementaryActivityType | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)

  const fetchComplementaryActivityTypes = async (pagination: PaginationArgs) => {
    try {
      const response = await complementaryActivityTypeService.findAll(pagination)
      setComplementaryActivity(response)
    } catch (error) {
      toast.error('Nao foi possivel carregas os tipos de atividades complementares')
    }
  }

  useEffect(() => {
    fetchComplementaryActivityTypes({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    })
  }, [pagination.pageIndex, pagination.pageSize]);


  const openUpdateModal = (item: ComplementaryActivityType) => {
    setItemToUpdate(item);
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (item: ComplementaryActivityType) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const table = useReactTable({
    columns: GetComplementaryActivityTypeColumns(openUpdateModal, openDeleteModal),
    data: complementaryActivity.rows,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    getFacetedRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      pagination,
    },
    pageCount: Math.ceil(complementaryActivity.count / pagination.pageSize)
  })

  return (
    <>
      <PageHeader
        title="Gerenciamento dos tipos de atividades complementares"
        description="Cadastre, visualize, atualize e remova os tipos de atividades complementares"
      />

      <div className="container max-w-full flex flex-col gap-6 p-6 h-fit ">
        <CreateActivityTypeDialog
          fetchComplementaryActivityTypes={fetchComplementaryActivityTypes}
          pagination={pagination}
        />

        <UpdateActivityTypeDialog
          fetchComplementaryActivityTypes={fetchComplementaryActivityTypes}
          pagination={pagination}
          setIsModalOpen={setIsUpdateModalOpen}
          isModalOpen={isUpdateModalOpen}
          item={itemToUpdate}
          setItem={setItemToUpdate}
        />

        <DeleteActivityTypeDialog
          fetchComplementaryActivityTypes={fetchComplementaryActivityTypes}
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
