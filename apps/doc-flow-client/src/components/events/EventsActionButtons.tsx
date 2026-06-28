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
  onEventsChanged?: () => void | Promise<void>;
}

export function EventsActionButtons({ isMyEventsPage, selectedRow, userId, onEventsChanged }: EventsActionButtonsProps) {
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


  const minCheckIn = event.min_checkin_time ?? 15;
  const maxCheckIn = event.max_checkin_time ?? 15;
  const minCheckOut = event.min_checkout_time ?? 15;
  const maxCheckOut = event.max_checkout_time ?? 15;

  const now = new Date();
  const startAtDate = new Date(event.start_at);
  const endAtDate = new Date(event.end_at);

  const checkInStart = new Date(startAtDate.getTime() - minCheckIn * 60 * 1000);
  const checkInEnd = new Date(startAtDate.getTime() + maxCheckIn * 60 * 1000);
  const checkOutStart = new Date(endAtDate.getTime() - minCheckOut * 60 * 1000);
  const checkOutEnd = new Date(endAtDate.getTime() + maxCheckOut * 60 * 1000);

  const isCheckInAllowed = now >= checkInStart && now <= checkInEnd;
  const isCheckOutAllowed = now >= checkOutStart && now <= checkOutEnd;

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
                disabled={userHasCheckedIn || !isCheckInAllowed}
                onSuccess={handlePresenceChange}
              />
              <QRCodeGeneratorModal
                eventId={event.id}
                modalType='Check-Out'
                userId={userId}
                disabled={userHasCheckedOut || !userHasCheckedIn || !isCheckOutAllowed}
                onSuccess={handlePresenceChange}
              />
            </>
          ) : (
            <>
              <ManualPresenceModal
                eventId={event.id}
                userId={userId}
                modalType='Check-In'
                disabled={userHasCheckedIn || !isCheckInAllowed}
                onSuccess={handlePresenceChange}
              />
              <ManualPresenceModal
                eventId={event.id}
                userId={userId}
                modalType='Check-Out'
                disabled={userHasCheckedOut || !userHasCheckedIn || !isCheckOutAllowed}
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
