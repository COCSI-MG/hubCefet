import { ApiError } from '@/api/errors/ApiError';
import { presenceService } from '@/api/services/presence.service';
import { PresenceUpdate } from '@/lib/types';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface EventScannerProps {
  eventId: string;
  eventStatus: 'upcoming' | 'started' | 'ended';
}

interface QrContent {
  userId: string;
  eventId: string;
  qrType: 'Check-In' | 'Check-Out'
}

export const EventScanner = ({ eventId, eventStatus }: EventScannerProps) => {
  const [loading, setLoading] = useState(false);
  const isProcessing = useRef(false);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (isProcessing.current || detectedCodes.length === 0) return;

    const rawValue = detectedCodes[0].rawValue;
    if (!rawValue) return;

    isProcessing.current = true;
    setLoading(true);

    try {
      const data: QrContent = JSON.parse(rawValue);

      if (data.eventId !== eventId) {
        toast.error("QR Code pertence a outro evento.");
        return
      }

      if (eventStatus !== 'started') {
        toast.error("O evento não está em andamento.");
        return
      }

      const isCheckIn = data.qrType === 'Check-In';
      const now = new Date().toISOString();

      const payload: PresenceUpdate = {
        ...(isCheckIn ? { check_in_date: now } : { check_out_date: now }),
      };

      const presence = await presenceService.findByUserAndEventId(data.userId, data.eventId)

      await presenceService.update(presence.id, payload)

      toast.success('escaneamento realizado com sucesso!');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
        return
      }
      toast.error('falha ao realizar escaneamento')
    } finally {
      setLoading(false)
      isProcessing.current = false;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">

      <div className="relative w-full aspect-square overflow-hidden rounded-xl border-2 border-gray-300 bg-black">
        <Scanner
          onScan={handleScan}
          scanDelay={2000}
          styles={{ container: { width: '100%', height: '100%' } }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold">
            Processando...
          </div>
        )}
      </div>
    </div>
  );
};
