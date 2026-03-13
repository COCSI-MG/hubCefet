import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { useState } from 'react';
import { UserTicketQR } from './UserTicketQR';

interface QRCodeGeneratorModalProps {
  userId: string;
  eventId: string;
  modalType: 'Check-In' | 'Check-Out'
  disabled?: boolean;
}

export function QRCodeGeneratorModal({ userId, eventId, modalType, disabled = false }: QRCodeGeneratorModalProps) {
  const [openModal, setOpenModal] = useState(false)

  const isCheckIn = modalType === 'Check-In';


  const buttonColorClass = isCheckIn
    ? "bg-emerald-600 hover:bg-emerald-500"
    : "bg-red-600 hover:bg-red-500";

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
          <Dialog.Title className="text-xl font-bold">
            QR Code para realizar o {modalType}
          </Dialog.Title>
          <Dialog.Description className="text-gray-600">
            Apresente o QR Code abaixo para um responsavel do evento
          </Dialog.Description>

          <UserTicketQR eventId={eventId} userId={userId} qrType={modalType} />

          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 text-gray-600">
              ✖
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

  )
}
