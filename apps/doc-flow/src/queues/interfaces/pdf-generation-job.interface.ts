export interface PdfGenerationJobData {
  presenceId: string;
  userId: string;
  eventId: string;
  userName: string;
  eventName: string;
  checkInDate: string;
  checkOutDate: string;
  totalHours: number;
  activityTypeId?: number | null;
  complementaryActivityTypeId?: number | null;
  extensionActivityTypeId?: number | null;
  activityHours?: number | null;
}
