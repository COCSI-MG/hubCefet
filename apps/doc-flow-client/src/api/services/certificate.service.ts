import ApiService from './api-service';
import { CertificateFormData } from '@/lib/types/certificate.types';

export class CertificateService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService(true);
  }

  /**
   * Faz upload de um certificado
   */
  async uploadCertificate(data: CertificateFormData): Promise<any> {
    try {
      if (!data.certificateFile) {
        throw new Error('Arquivo de certificado é obrigatório');
      }

      const formData = new FormData();
      formData.append('course_name', data.courseName);
      formData.append('hours', data.hours.toString());
      formData.append('activity_type_id', data.activityType);
      formData.append('certificate', data.certificateFile);

      if (data.complementaryHoursType) {
        formData.append('complementary_activity_type_id', data.complementaryHoursType)
      }

      const response = await this.apiService.post(
        '/activities/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error('Erro ao fazer upload do certificado:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Tipo de atividade não encontrado');
      } else if (error.response?.status === 413) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      } else if (error.response?.status === 400) {
        throw new Error('Dados inválidos ou arquivo não suportado');
      } else {
        throw new Error('Erro interno do servidor. Tente novamente.');
      }
    }
  }

  /**
   * Busca atividades do usuário
   */
  async getMyActivities(): Promise<any> {
    try {
      return await this.apiService.get('/activities/my-activities');
    } catch (error) {
      console.error('Erro ao buscar minhas atividades:', error);
      throw new Error('Erro ao carregar suas atividades');
    }
  }

  /**
   * Busca estatísticas do usuário
   */
  async getMyStats(): Promise<any> {
    try {
      return await this.apiService.get('/activities/my-stats');
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao carregar estatísticas');
    }
  }

  /**
   * Busca uma atividade específica
   */
  async getActivity(id: number): Promise<any> {
    try {
      return await this.apiService.get(`/activities/${id}`);
    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      throw new Error('Erro ao carregar atividade');
    }
  }

  /**
   * Atualiza uma atividade
   */
  async updateActivity(id: number, data: Partial<CertificateFormData>): Promise<any> {
    try {
      const updateData = {
        course_name: data.courseName,
        hours: data.hours,
        activity_type_id: data.activityType,
      };

      return await this.apiService.patch(`/activities/${id}`, updateData);
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      throw new Error('Erro ao atualizar atividade');
    }
  }

  /**
   * Busca tipos de atividades
   */
  async getActivityTypes(): Promise<any> {
    try {
      return await this.apiService.get('/activities/types');
    } catch (error) {
      console.error('Erro ao buscar tipos de atividade:', error);
      throw new Error('Erro ao carregar tipos de atividade');
    }
  }

  /**
   * Busca atividades para o professor revisar
   */
  async getActivitiesForReview(): Promise<any> {
    try {
      return await this.apiService.get('/activities/for-review');
    } catch (error) {
      console.error('Erro ao buscar atividades para revisar:', error);
      throw new Error('Erro ao carregar atividades para revisar');
    }
  }

  /**
   * Aprovar ou rejeitar uma atividade
   */
  async reviewActivity(id: string, decision: 'APPROVED' | 'REJECTED', comments?: string): Promise<any> {
    try {
      const data = {
        decision,
        comments: comments || ''
      };
      return await this.apiService.post(`/activities/${id}/review`, data);
    } catch (error) {
      console.error('Erro ao avaliar atividade:', error);
      throw new Error('Erro ao avaliar atividade');
    }
  }

  /**
   * Baixar certificado de uma atividade
   */
  async downloadCertificate(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/activities/${id}/download-certificate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar certificado');
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificado-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      throw new Error('Erro ao baixar certificado');
    }
  }

  /**
   * Remove uma atividade
   */
  async deleteActivity(id: number): Promise<any> {
    try {
      return await this.apiService.delete(`/activities/${id}`);
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      throw new Error('Erro ao deletar atividade');
    }
  }
}

export const certificateService = new CertificateService();


