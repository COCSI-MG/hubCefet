import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/lib/schemas/user.schema";
import { userService } from "@/api/services/users.service";
import { toast } from "sonner";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { ApiError } from "@/api/errors/ApiError";

interface ResetPasswordDialogProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  item: User | null;
  setItem: (item: User | null) => void;
}

export function ResetPasswordDialog({
  isModalOpen,
  setIsModalOpen,
  item,
  setItem,
}: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await userService.resetPassword(item.id);
      toast.success("Senha resetada com sucesso para a senha padrão.");
      closeModal();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao resetar a senha");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setItem(null);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resetar Senha</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja resetar a senha do usuário <strong>{item?.full_name}</strong> para a senha padrão do sistema?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Resetar Senha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
