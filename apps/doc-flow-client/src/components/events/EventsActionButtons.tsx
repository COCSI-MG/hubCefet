import { EventsSubscribeButton } from './EventsSubscribeButton';
import { Row } from '@tanstack/react-table';
import { Event } from '@/lib/types';
import { QRCodeGeneratorModal } from '../QRCodeGeneratorModal';
import { ManualPresenceModal } from './ManualPresenceModal';
import { useCallback, useEffect, useState } from 'react';
import { presenceService } from '@/api/services/presence.service';
import { ApiError } from '@/api/errors/ApiError';
import { toast } from 'sonner';

interface EventsActionButtonsProps {
  isMyEventsPage: boolean;
  selectedRow: Row<Event>;
  userId: string;
  eventAlreadyStarted: boolean;
  onEventsChanged?: () => void | Promise<void>;
}

export function EventsActionButtons({ isMyEventsPage, selectedRow, userId, eventAlreadyStarted, onEventsChanged }: EventsActionButtonsProps) {
  const [userHasCheckedIn, setUserHasCheckedIn] = useState(false)
  const [userHasCheckedOut, setUserHasCheckedOut] = useState(false)
  const [userIsSubscribed, setUserIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const event = selectedRow.original;

  const fetchPresenceStatus = useCallback(async () => {
    try {
      const presence = await presenceService.findByUserAndEventId(userId, event.id)
      if (presence) {
        setUserIsSubscribed(!!presence)
        setUserHasCheckedIn(!!presence.check_in_date)
        setUserHasCheckedOut(!!presence.check_out_date)
      } else {
        setUserIsSubscribed(false)
        setUserHasCheckedIn(false)
        setUserHasCheckedOut(false)
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
  }, [event.id, userId])

  const handlePresenceChange = useCallback(async () => {
    await fetchPresenceStatus()
    await onEventsChanged?.()
  }, [fetchPresenceStatus, onEventsChanged])

  useEffect(() => {
    fetchPresenceStatus()
  }, [fetchPresenceStatus])


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
        <div className='flex flex-wrap gap-2'>
          {event.presence_option === 'qrcode' ? (
            <>
              <QRCodeGeneratorModal
                eventId={event.id}
                modalType='Check-In'
                userId={userId}
                disabled={userHasCheckedIn || !eventAlreadyStarted}
                onSuccess={handlePresenceChange}
              />
              <QRCodeGeneratorModal
                eventId={event.id}
                modalType='Check-Out'
                userId={userId}
                disabled={userHasCheckedOut || !userHasCheckedIn || !eventAlreadyStarted}
                onSuccess={handlePresenceChange}
              />
            </>
          ) : (
            <>
              <ManualPresenceModal
                eventId={event.id}
                userId={userId}
                modalType='Check-In'
                disabled={userHasCheckedIn || !eventAlreadyStarted}
                onSuccess={handlePresenceChange}
              />
              <ManualPresenceModal
                eventId={event.id}
                userId={userId}
                modalType='Check-Out'
                disabled={userHasCheckedOut || !userHasCheckedIn || !eventAlreadyStarted}
                onSuccess={handlePresenceChange}
              />
            </>
          )}
        </div>

      ) : (
        <EventsSubscribeButton
          selectedRow={selectedRow}
          userIsSubscribed={userIsSubscribed}
          onSuccess={handlePresenceChange}
        />
      )}
    </div>
  )
}
