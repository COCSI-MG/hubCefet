import QRCode from "react-qr-code";

interface UserTicketQRProps {
  userId: string;
  eventId: string;
  qrType: 'Check-In' | 'Check-Out'
}

export function UserTicketQR({ userId, eventId, qrType }: UserTicketQRProps) {
  const qrData = JSON.stringify({ userId, eventId, qrType });

  return (
    <div className="bg-white pt-4">
      <QRCode
        size={256}
        className="h-auto max-w-full w-full"
        value={qrData}
        viewBox="0 0 256 256"
      />
    </div>
  );
};
