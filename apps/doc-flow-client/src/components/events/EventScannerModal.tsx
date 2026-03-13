import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { EventScanner } from './EventScanner'
import { useState } from 'react';

interface EventScannerProps {
  eventId: string;
  eventStatus: 'upcoming' | 'started' | 'ended';
  eventAlreadyStarted: boolean;
}

export function EventScannerModal({ eventId, eventStatus, eventAlreadyStarted }: EventScannerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="secondary"
          className="rounded-2xl text-white bg-cyan-600 hover:bg-cyan-500"
          size="sm"
          disabled={!eventAlreadyStarted}
        >
          Abrir Scanner
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 w-[90vw] max-w-md max-h-[85vh]">
          <Dialog.Title className="text-xl font-bold">
            Escanear QR Code
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-4">
            Posicione a câmera para o código para realizar a leitura.
          </Dialog.Description>

          <div className="flex justify-center">
            <EventScanner eventId={eventId} eventStatus={eventStatus} />
          </div>

          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 text-gray-600 hover:text-black">
              ✖
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root >
  )
}
