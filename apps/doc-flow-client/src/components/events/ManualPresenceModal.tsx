import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { useState } from 'react';
import { presenceService } from '@/api/services/presence.service';
import { ApiError } from '@/api/errors/ApiError';
import { toast } from 'sonner';
import { PresenceUpdate } from '@/lib/types';

interface ManualPresenceModalProps {
  eventId: string;
  userId: string;
  modalType: 'Check-In' | 'Check-Out';
  disabled?: boolean;
  onSuccess?: () => void;
}

export function ManualPresenceModal({ eventId, userId, modalType, disabled = false, onSuccess }: ManualPresenceModalProps) {
  const [openModal, setOpenModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const isCheckIn = modalType === 'Check-In';

  const buttonColorClass = isCheckIn
    ? "bg-emerald-600 hover:bg-emerald-500"
    : "bg-red-600 hover:bg-red-500";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const presence = await presenceService.findByUserAndEventId(userId, eventId);

      const now = new Date().toISOString();
      const payload: PresenceUpdate = {
        ...(isCheckIn ? { check_in_date: now } : { check_out_date: now }),
      };

      await presenceService.update(presence.id, payload);

      toast.success(`${modalType} realizado com sucesso!`);
      setOpenModal(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error(`Falha ao realizar ${modalType}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
      <Dialog.Trigger asChild>
        <Button
          variant="secondary"
          className={`rounded-2xl text-white ${buttonColorClass}`}
          size='sm'
          disabled={disabled}
        >
          Faca o seu {modalType}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 w-[90vw] max-w-md max-h-[85vh]">
          <Dialog.Title className="text-xl font-bold mb-4">
            Confirmação de {modalType}
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">
            Deseja confirmar o seu {modalType} neste evento agora?
          </Dialog.Description>

          <div className="flex justify-end gap-3 mt-4">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              className={`text-white ${buttonColorClass}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
