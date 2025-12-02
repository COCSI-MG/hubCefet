import { complementaryActivityTypeService } from "@/api/services/complementary-activity-type-service";
import { Pagination as PaginationArgs } from "@/lib/types";
import { Pagination } from "@/pages/complementaryActivityType/ComplementaryActivityType";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CirclePlus, X } from "lucide-react";

interface CreationDialogProps {
  pagination: Pagination
  fetchComplementaryActivityTypes: (pagination: PaginationArgs) => Promise<void>;
}

const complementaryActivityTypeSchema = z.object({
  name: z.string().min(5, "O campo precisa ter no minimo 5 caracteres").max(50, "O nome pode ter no maximo 50 caracteres"),
  description: z.string().max(500, "A descrição pode ter no maximo 500 caracteres").optional(),
})

type createComplementaryActivityType = z.infer<typeof complementaryActivityTypeSchema>

export function CreateActivityTypeDialog({ pagination, fetchComplementaryActivityTypes }: CreationDialogProps) {
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<createComplementaryActivityType>({
    resolver: zodResolver(complementaryActivityTypeSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: ""
    }
  })

  const onSubmit = async (data: createComplementaryActivityType) => {
    try {
      await complementaryActivityTypeService.create(data)

      setIsCreationModalOpen(false)
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

  return (
    < Dialog.Root
      open={isCreationModalOpen}
      onOpenChange={
        (isOpen) => {
          setIsCreationModalOpen(isOpen)
          if (!isOpen) { reset() }
        }
      }
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
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 w-[38rem]">
          <Dialog.Title className="text-xl font-bold">
            Atividades complementares
          </Dialog.Title>
          <Dialog.Description className="text-gray-600">
            Insira os dados para criar um um tipo de atividade complementar
          </Dialog.Description>

          <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
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
            <button className="absolute top-2 right-2 text-gray-600 rounded-lg p-1 hover:bg-sky-900">
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root >
  )
}
