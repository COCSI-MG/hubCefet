import { EventsSubscribeButton } from './EventsSubscribeButton';
import { Row } from '@tanstack/react-table';
import { Event } from '@/lib/types';
import { QRCodeGeneratorModal } from '../QRCodeGeneratorModal';
import { useEffect, useState } from 'react';
import { presenceService } from '@/api/services/presence.service';
import { ApiError } from '@/api/errors/ApiError';
import { toast } from 'sonner';

interface EventsActionButtonsProps {
  isMyEventsPage: boolean;
  selectedRow: Row<Event>;
  userId: string;
  eventAlreadyStarted: boolean;
}

export function EventsActionButtons({ isMyEventsPage, selectedRow, userId, eventAlreadyStarted }: EventsActionButtonsProps) {
  const [userHasCheckedIn, setUserHasCheckedIn] = useState(false)
  const [userHasCheckedOut, setUserHasCheckedOut] = useState(false)
  const [userIsSubscribed, setUserIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const event = selectedRow.original;

  const fetchPresenceStatus = async () => {
    try {
      const presence = await presenceService.findByUserAndEventId(userId, event.id)
      if (presence) {
        setUserIsSubscribed(!!presence)
        setUserHasCheckedIn(!!presence.check_in_date)
        setUserHasCheckedOut(!!presence.check_out_date)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return
      }

      toast.error("Erro inesperado ao procurar evento.");
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPresenceStatus()
  }, [userId, event.id])


  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        {isMyEventsPage && <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 md:flex-row min-h-[32px]">
      {isMyEventsPage ? (
        <div className='flex gap-2'>
          <QRCodeGeneratorModal
            eventId={event.id}
            modalType='Check-In'
            userId={userId}
            disabled={userHasCheckedIn || !eventAlreadyStarted}
          />
          <QRCodeGeneratorModal
            eventId={event.id}
            modalType='Check-Out'
            userId={userId}
            disabled={userHasCheckedOut || !userHasCheckedIn || !eventAlreadyStarted}
          />
        </div>

      ) : (
        <EventsSubscribeButton selectedRow={selectedRow} userIsSubscribed={userIsSubscribed} />
      )}
    </div>
  )
}
