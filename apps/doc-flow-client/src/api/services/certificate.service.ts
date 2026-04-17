import { ApiError } from '../errors/ApiError';
import ApiService from './api-service';
import { CertificateFormData, UpdateCertificateData } from '@/lib/types/certificate.types';

export class CertificateService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService(true);
  }

  async uploadCertificate(data: CertificateFormData): Promise<any> {
    const formData = new FormData();

    if (!data.certificateFile) {
      throw new Error("Arquivo de certificado é obrigatório");
    }

    formData.append('course_name', data.courseName);
    formData.append('hours', data.hours.toString());
    formData.append('activity_type_id', data.activityType);
    formData.append('certificate', data.certificateFile);

    if (data.complementaryHoursType) {
      formData.append('complementary_activity_type_id', data.complementaryHoursType)
    }

    if (data.extensionHoursType) {
      formData.append('extension_activity_type_id', data.extensionHoursType)
    }

    return await this.apiService.post('/activities/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getMyActivities(): Promise<any> {
    return await this.apiService.get('/activities/my-activities');
  }

  async getMyStats(): Promise<any> {
    return await this.apiService.get('/activities/my-stats');
  }

  async getActivity(id: string): Promise<any> {
    return await this.apiService.get(`/activities/${id}`);
  }

  async updateActivity(id: string, data: UpdateCertificateData): Promise<any> {
    const formData = new FormData();

    if (data.courseName) {
      formData.append('course_name', data.courseName);
    }

    if (typeof data.hours === 'number') {
      formData.append('hours', data.hours.toString());
    }

    if (data.activityType) {
      formData.append('activity_type_id', data.activityType);
    }

    if (data.complementaryHoursType) {
      formData.append(
        'complementary_activity_type_id',
        data.complementaryHoursType ?? '',
      );
    }

    if (data.extensionHoursType) {
      formData.append(
        'extension_activity_type_id',
        data.extensionHoursType ?? '',
      );
    }

    if (data.certificateFile) {
      formData.append('certificate', data.certificateFile);
    }

    return await this.apiService.patch(`/activities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getActivityTypes(): Promise<any> {
    return await this.apiService.get('/activities/types');
  }

  async getActivitiesForReview(): Promise<any> {
    return await this.apiService.get('/activities/for-review');
  }

  async reviewActivity(id: string, decision: 'APPROVED' | 'REJECTED', comments?: string): Promise<any> {
    const data = {
      decision,
      comments: comments || ''
    };

    return await this.apiService.post(`/activities/${id}/review`, data);
  }

  async downloadCertificate(id: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const response = await fetch(
      `${API_URL}/activities/${id}/download-certificate`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) {
      throw new ApiError("Eror ao baixar certificado", 500)
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${id}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }

  async deleteActivity(id: number): Promise<any> {
    return await this.apiService.delete(`/activities/${id}`);
  }
}

export const certificateService = new CertificateService();
