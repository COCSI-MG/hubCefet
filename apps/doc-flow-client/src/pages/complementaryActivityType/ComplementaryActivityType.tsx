import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pagination as PaginationArgs } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { ComplementaryActivityTypeColumns } from "@/components/complementaryActivityType/ComplementaryActivityTypeColumns";
import { complementaryActivityTypeService, ComplementaryActivityTypeWithTotal } from "@/api/services/complementary-activity-type-service";
import { Button } from "@/components/ui/button";
import { CirclePlus, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

const complementaryActivityTypeSchema = z.object({
  name: z.string().min(5, "O campo precisa ter no minimo 5 caracteres").max(50, "O nome pode ter no maximo 50 caracteres"),
  description: z.string().max(500, "A descrição pode ter no maximo 500 caracteres").optional(),
})

type createComplementaryActivityType = z.infer<typeof complementaryActivityTypeSchema>

export function ComplementaryActivityTypeManagement() {
  const [complementaryActivity, setComplementaryActivity] = useState<ComplementaryActivityTypeWithTotal>({
    rows: [],
    count: 0
  })
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<createComplementaryActivityType>({
    resolver: zodResolver(complementaryActivityTypeSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: ""
    }
  })

  const fetchComplementaryActivityTypes = async (pagination: PaginationArgs) => {
    try {
      const response = await complementaryActivityTypeService.findAll(pagination)
      setComplementaryActivity(response)
    } catch (error) {
      toast.error('Nao foi possivel carregas os tipos de atividades complementares')
    }
  }

  const createComplementaryActivityType = async (data: createComplementaryActivityType) => {
    try {
      await complementaryActivityTypeService.create(data)

      setIsModalOpen(false)
      reset()

      await fetchComplementaryActivityTypes({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      });

      toast.success("Tipo atividade complementar criado com sucesso!")
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message)
        return
      }

      toast.error("Nao foi possivel criar um tipo de atividade complementar")
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
    rowCount: complementaryActivity.count,
  })

  return (
    <>
      <PageHeader
        title="Gerenciamento dos tipos de atividades complementares"
        description="Cadastre, visualize, atualize e remova os tipos de atividades complementares"
      />

      <div className="container max-w-full flex flex-col gap-6 p-6 h-fit ">
        <Dialog.Root
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) reset();
          }}
        >
          <Dialog.Trigger asChild>
            <Button
              className="self-end rounded-2xl bg-sky-900 text-white hover:bg-sky-700 text-lg [&_svg]:size-5"
              size='lg'
            >
              Adicionar
              <CirclePlus />
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
              <Dialog.Title className="text-xl font-bold">
                Atividades complementares
              </Dialog.Title>
              <Dialog.Description className="text-gray-600">
                Insira os dados para criar um um tipo de atividade complementar
              </Dialog.Description>

              <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit(createComplementaryActivityType)}>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 font-bold">
                    Nome <span className="text-red-600">*</span>
                  </label>
                  <input className={` 
                    bg-gray-50 h-8 rounded-sm px-2 outline-none border 
                    ${errors.name ? " border-red-500" : " border-gray-300"} 
                    focus:border-gray-600
                    `}
                    {...register("name")}
                  />

                  {errors.name && (
                    <span className="text-red-600 text-sm">{errors.name.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 font-bold">Descrição</label>
                  <input className={` 
                    bg-gray-50 h-8 rounded-sm px-2 outline-none border 
                    ${errors.description ? " border-red-500" : " border-gray-300"} 
                    focus:border-gray-600
                    `}
                    {...register("description")}
                  />
                  {errors.description && (
                    <span className="text-red-600 text-sm">{errors.description.message}</span>
                  )}
                </div>

                <Button
                  className="self-end rounded-2xl bg-sky-900 text-white hover:bg-sky-700 text-lg [&_svg]:size-5"
                  size='default'
                  type="submit"
                >
                  Criar
                </Button>
              </form>

              <Dialog.Close asChild>
                <button className="absolute top-2 right-2 text-gray-600">
                  <X />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>



        <SearchBar
          placeholder="Pesquisar arquivos"
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />

        <DataTable table={table} />
      </div >
    </>
  )
}
