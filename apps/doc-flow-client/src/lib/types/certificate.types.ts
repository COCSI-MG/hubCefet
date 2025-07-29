export interface ComplementaryHourType {
  id: string;
  name: string;
  description?: string;
}

export interface CertificateFormData {
  complementaryHourType: string;
  hours: number;
  courseName: string;
  certificateFile: File | null;
}

export interface CertificateFormSchema {
  complementaryHourType: string;
  hours: number;
  courseName: string;
} 
 
 