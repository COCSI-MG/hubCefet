import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ProfessorSelectionService {
  constructor(private readonly usersService: UsersService) {}

  async selectRandomProfessors(count: number = 3): Promise<string[]> {
    const result = await this.usersService.findAll(1000, 0, 'professor');
    
    if (!result.success || !result.data.users.length) {
      throw new Error('Nenhum professor encontrado no sistema');
    }

    const professors = result.data.users;
    
    if (professors.length < count) {
      throw new Error(`Não há professores suficientes no sistema. Encontrados: ${professors.length}, necessários: ${count}`);
    }

    const shuffled = [...professors].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    return selected.map(prof => prof.id);
  }
} 
 
 