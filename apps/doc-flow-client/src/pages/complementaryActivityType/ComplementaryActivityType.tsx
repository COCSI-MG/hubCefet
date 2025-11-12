import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pagination as PaginationArgs } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { ComplementaryActivityTypeColumns } from "@/components/complementaryActivityType/ComplementaryActivityTypeColumns";
import { ComplementaryActivityType, complementaryActivityTypeService } from "@/api/services/complementary-activity-type-service";


interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export function ComplementaryActivityTypeManagement() {
  const [data, setData] = useState<ComplementaryActivityType[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchComplementaryActivityTypes = async (pagination: PaginationArgs) => {
    try {
      const response = await complementaryActivityTypeService.findAll(pagination)
      setData(response)
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

  const table = useReactTable({
    columns: ComplementaryActivityTypeColumns,
    data,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    getFacetedRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      pagination,
    },
    rowCount: data.length,
  })

  return (
    <div className="container max-w-full flex flex-col space-y-2 p-6 h-fit">
      <PageHeader
        title="Gerenciamento dos tipos de atividades complementares"
        description="Cadastre, atualize, remova e visualize os tipos de atividades complementares"
      />

      <div className="flex flex-col gap-4">
        <SearchBar
          placeholder="Pesquisar arquivos"
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        {/* TODO: adicionar botao para adicionar atividades complementares */}

        <DataTable table={table} />
      </div>
    </div>
  )
}
