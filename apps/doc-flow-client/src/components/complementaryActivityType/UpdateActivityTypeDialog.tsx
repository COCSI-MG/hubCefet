import { ComplementaryActivityType, complementaryActivityTypeService, UpsertComplementaryActivityType } from "@/api/services/complementary-activity-type-service"
import { Pagination } from "@/pages/complementaryActivityType/ComplementaryActivityType"
import { Pagination as PaginationArgs } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useEffect } from "react";

interface UpdateActivityTypeDialogProps {
  pagination: Pagination;
  fetchComplementaryActivityTypes: (pagination: PaginationArgs) => Promise<void>;
  item: ComplementaryActivityType | null;
  setItem: React.Dispatch<React.SetStateAction<ComplementaryActivityType | null>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const complementaryActivityTypeSchema = z.object({
  name: z.string().min(5, "O campo precisa ter no minimo 5 caracteres").max(50, "O nome pode ter no maximo 50 caracteres"),
  description: z.string().max(500, "A descrição pode ter no maximo 500 caracteres").optional(),
})

type updateComplementaryActivityType = z.infer<typeof complementaryActivityTypeSchema>


export function UpdateActivityTypeDialog({ pagination, fetchComplementaryActivityTypes, item, isModalOpen, setIsModalOpen, setItem }: UpdateActivityTypeDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<updateComplementaryActivityType>({
    resolver: zodResolver(complementaryActivityTypeSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: ""
    }
  })

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        description: item.description
      })
    }
  }, [item])

  const handleUpdate = async (formData: UpsertComplementaryActivityType) => {
    if (!item) return

    await complementaryActivityTypeService.update(item.id, formData)
    setIsModalOpen(false)
    reset()

    await fetchComplementaryActivityTypes({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });

    toast.success("Tipo atividade complementar updateada com sucesso!")
  }


  return (
    <Dialog.Root
      open={isModalOpen}
      onOpenChange={
        (open) => {
          setIsModalOpen(open)
          if (!open) {
            reset()
            setItem(null)
          }
        }
      }
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 w-[38rem]">
          <Dialog.Title className="text-xl font-bold">
            Atualizar Tipo de Atividade
          </Dialog.Title>
          <Dialog.Description className="text-gray-600">
            Atualiz os dados de um tipo de atividade complementar
          </Dialog.Description>


          <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit(handleUpdate)}>
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-bold">
                Nome <span className="text-red-600">*</span>
              </label>
              <input className={`
                      bg-gray-50 h-8 rounded-sm px-2 outline-none border 
                      ${errors.name ? "border-red-500" : "border-gray-300"} 
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
              <input
                className={`
                      bg-gray-50 h-8 rounded-sm px-2 outline-none border 
                      ${errors.description ? "border-red-500" : "border-gray-300"} 
                      focus:border-gray-600
                    `}
                {...register("description")}
              />

              {errors.description && (
                <span className="text-red-600 text-sm">{errors.description.message}</span>
              )}
            </div>

            <Button
              type="submit"
              className="self-end rounded-2xl bg-sky-900 text-white hover:bg-sky-700"
            >
              Salvar
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

  )
}
