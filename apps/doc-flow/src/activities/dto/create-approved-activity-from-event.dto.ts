export class CreateApprovedActivityFromEventDto {
  userId: string;
  eventName: string;
  certificateUrl: string;
  activityTypeId: number;
  hours: number;
  complementaryActivityTypeId?: number | null;
  extensionActivityTypeId?: number | null;
}
