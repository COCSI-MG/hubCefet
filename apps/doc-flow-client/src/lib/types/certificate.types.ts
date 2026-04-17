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
  extensionHoursType?: string | undefined;
}

export interface UpdateCertificateData {
  activityType?: string;
  hours?: number;
  courseName?: string;
  complementaryHoursType?: string | null;
  extensionHoursType?: string | null;
  certificateFile?: File | null;
}

export enum ActivityTypeEnum {
  COMPLEMENTARY = 1,
  EXTENSION = 2
}
