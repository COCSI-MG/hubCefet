import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Pagination } from "@/pages/complementaryActivityType/ComplementaryActivityType"
import { Pagination as PaginationArgs } from "@/lib/types";
import { X } from "lucide-react";
import { ApiError } from "@/api/errors/ApiError";
import { Event } from "@/lib/schemas/event.schema";
import { eventService } from "@/api/services/event.service";

interface DeleteEventsDialogProps {
  pagination: Pagination;
  fetchEvent: (pagination: PaginationArgs) => Promise<void>;
  item: Event | null;
  setItem: React.Dispatch<React.SetStateAction<Event | null>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function DeleteEventDialog({ fetchEvent, pagination, item, isModalOpen, setIsModalOpen, setItem }: DeleteEventsDialogProps) {

  const handleDelete = async () => {
    if (!item) return

    try {
      await eventService.delete(item.id)
      setIsModalOpen(false)

      await fetchEvent({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      });

      toast.success("Evento excluido com sucesso!")
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
        return
      }

      toast.error("Nao foi possivel deletar o evento")
    }
  }

  return (
    <Dialog.Root
      open={isModalOpen}
      onOpenChange={
        (open) => {
          setIsModalOpen(open)
          if (!open) {
            setItem(null)
          }
        }
      }
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg z-50 w-[38rem]">
          <Dialog.Title className="text-xl font-bold">
            Confirmar Exclusão
          </Dialog.Title>

          <p className="mt-4 text-gray-700">
            Tem certeza que deseja excluir o evento:
            <br />
            <strong>{item?.name}</strong>?
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              className="self-end rounded-2xl text-white bg-neutral-400 hover:bg-neutral-700 text-lg [&_svg]:size-5"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="self-end rounded-2xl hover:bg-red-500/70 text-white text-lg [&_svg]:size-5"
              variant="destructive"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </div>

          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 text-gray-600 rounded-lg p-1 hover:bg-sky-900">
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
