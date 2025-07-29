import { privateAxiosInstance } from '../axios-instance';

export interface User {
  id: string;
  full_name: string;
  email: string;
  profile?: {
    id: string;
    name: string;
  };
}

export interface UsersResponse {
  users: User[];
  success: boolean;
  status: number;
  message: string | null;
}

class UsersService {
  private baseUrl = '/users';

  async getAllProfessors(): Promise<User[]> {
    try {
      const response = await privateAxiosInstance.get(`${this.baseUrl}/limit/100/offset/0?profile=professor`);
      
      if (response.data && response.data.data && Array.isArray(response.data.data.users)) {
        const professors = response.data.data.users;
        return professors;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      return [];
    }
  }

  async getStudents(searchTerm: string = '', limit: number = 100): Promise<User[]> {
    try {
      let url = `${this.baseUrl}/limit/${limit}/offset/0?profile=student`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await privateAxiosInstance.get(url);
      
      if (response.data && response.data.data && Array.isArray(response.data.data.users)) {
        const students = response.data.data.users;
        
        return students;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await privateAxiosInstance.get(`${this.baseUrl}/${id}`);
      
      if (response.data && response.data.data && response.data.data.user) {
        return response.data.data.user;
      }
      
      return null;
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      return null;
    }
  }
}

export const usersService = new UsersService(); 