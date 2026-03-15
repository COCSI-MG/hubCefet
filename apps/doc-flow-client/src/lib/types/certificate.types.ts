export interface ActivityType {
  id: string;
  name: string;
}

export interface CertificateFormData {
  activityType: string;
  hours: number;
  courseName: string;
  certificateFile: File | null;
  complementaryHoursType?: string | undefined;
}

export enum ActivityTypeEnum {
  COMPLEMENTARY = 1,
  EXTENSION = 2
}


