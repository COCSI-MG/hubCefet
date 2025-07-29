import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePresenceDto } from './dto/create-presence.dto';
import { UpdatePresenceDto } from './dto/update-presence.dto';
import { PresenceRepository } from './repositories/presence.repository.interface';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import { Presence } from './entities/presence.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PdfGenerationJobData } from '../queues/interfaces/pdf-generation-job.interface';

@Injectable()
export class PresencesService {
  constructor(
    @Inject('IPresenceRepository')
    private readonly presenceRepository: PresenceRepository,
    private readonly eventService: EventsService,
    private readonly userService: UsersService,
    @InjectQueue('pdf-generation') private pdfQueue: Queue<PdfGenerationJobData>,
  ) {}

  async create(
    userId: string,
    createPresenceDto: CreatePresenceDto,
  ): Promise<null | Presence> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const [event] = await this.eventService.findOne(
      createPresenceDto.event_id,
    );
    if (!event) {
      throw new Error('Event not found');
    }

    if (createPresenceDto.check_in_date) {
        const checkInDate = new Date(createPresenceDto.check_in_date);
        const eventStartDate = new Date(event.start_at);
        const eventEndDate = new Date(event.end_at);
        
        if (checkInDate < eventStartDate) {
            throw new Error('Check-in só pode ser feito a partir do horário de início do evento');
        }
        
        if (checkInDate > eventEndDate) {
            throw new Error('Não é possível fazer check-in em um evento que já terminou');
        }
    } else if (createPresenceDto.status === 'present') {
        const currentDate = new Date();
        const eventStartDate = new Date(event.start_at);
        const eventEndDate = new Date(event.end_at);
        
        if (currentDate < eventStartDate) {
            throw new Error('Check-in só pode ser feito a partir do horário de início do evento');
        }
        
        if (currentDate > eventEndDate) {
            throw new Error('Não é possível fazer check-in em um evento que já terminou');
        }
    }

    const [presence, created] =
      await this.presenceRepository.findOrCreatedPresence(
        userId,
        createPresenceDto.event_id,
        createPresenceDto.status,
        createPresenceDto.check_in_date || null,
        createPresenceDto.check_out_date || null,
      );
    if (!created) {
      return null;
    }
    return presence;
  }

  async findAll() {
    return await this.presenceRepository.findAll();
  }

  async findOne(id: string) {
    return await this.presenceRepository.findOne(id);
  }

  async update(id: string, updatePresenceDto: UpdatePresenceDto) {
    const previousPresence = await this.presenceRepository.findOne(id);

    if (updatePresenceDto.check_in_date && previousPresence) {
        const [event] = await this.eventService.findOne(previousPresence.event_id);
        if (event) {
            const checkInDate = new Date(updatePresenceDto.check_in_date);
            const eventStartDate = new Date(event.start_at);
            const eventEndDate = new Date(event.end_at);
            
            if (checkInDate < eventStartDate) {
                throw new Error('Check-in só pode ser feito a partir do horário de início do evento');
            }
            
            if (checkInDate > eventEndDate) {
                throw new Error('Não é possível fazer check-in em um evento que já terminou');
            }
        }
    } else if (updatePresenceDto.status === 'present' && previousPresence) {
        const [event] = await this.eventService.findOne(previousPresence.event_id);
        if (event) {
            const currentDate = new Date();
            const eventStartDate = new Date(event.start_at);
            const eventEndDate = new Date(event.end_at);
            
            if (currentDate < eventStartDate) {
                throw new Error('Check-in só pode ser feito a partir do horário de início do evento');
            }
            
            if (currentDate > eventEndDate) {
                throw new Error('Não é possível fazer check-in em um evento que já terminou');
            }
        }
    }

    if (updatePresenceDto.check_in_date && updatePresenceDto.check_out_date) {
        const checkInDate = new Date(updatePresenceDto.check_in_date);
        const checkOutDate = new Date(updatePresenceDto.check_out_date);
        
        if (checkInDate >= checkOutDate) {
          throw new Error('Data de check-in deve ser anterior à data de check-out');
        }
    }

    if (updatePresenceDto.check_out_date && updatePresenceDto.status === 'registered' && previousPresence) {
    const [event] = await this.eventService.findOne(previousPresence.event_id);
    if (event) {
        const checkOutDate = new Date(updatePresenceDto.check_out_date);
        const eventEndDate = new Date(event.end_at);
        
        const maxCheckOutTime = new Date(eventEndDate.getTime() + (2 * 60 * 60 * 1000));
        
        if (checkOutDate > maxCheckOutTime) {
        throw new Error('Check-out deve ser feito até 2 horas após o término do evento');
        }
    }
    }
    
    const updatedPresence = await this.presenceRepository.update(id, updatePresenceDto);
    
    const isRealCheckOut = updatePresenceDto.check_out_date && 
      updatePresenceDto.status === 'registered' &&
      previousPresence?.status === 'present' && 
      updatedPresence;

    if (isRealCheckOut) {
      
      const userResult = await this.userService.findOne(updatedPresence.user_id);
      const [event] = await this.eventService.findOne(updatedPresence.event_id);
      
      const user = userResult?.data?.user;
      
      if (user && event && updatedPresence.check_in_date) {
        
        const checkInDate = new Date(updatedPresence.check_in_date);
        const checkOutDate = new Date(updatePresenceDto.check_out_date);
        const totalHours = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60) * 100) / 100;
        
        const pdfJobData = {
          presenceId: updatedPresence.id,
          userId: user.id,
          eventId: event.id,
          userName: user.full_name,
          eventName: event.name,
          checkInDate: updatedPresence.check_in_date.toString(),
          checkOutDate: updatePresenceDto.check_out_date,
          totalHours
        };
        
        this.pdfQueue.add('generate-certificate', pdfJobData)
          .then(job => {
            Logger.log(`[ASYNC] [QUEUE] Job PDF enfileirado com sucesso para presença ${updatedPresence.id}. Job ID: ${job.id}`);
          })
          .catch(error => {
            Logger.error(`[ERROR] Erro ao agendar PDF para presença ${updatedPresence.id}:`, error);
          });
      } else {
        Logger.warn(`[DEBUG] Condições NÃO atendidas para PDF:`, {
          hasCheckOut: !!updatePresenceDto.check_out_date,
          hasUser: !!user,
          hasEvent: !!event,
          hasCheckIn: !!updatedPresence.check_in_date,
          userId: updatedPresence.user_id,
          eventId: updatedPresence.event_id
        });
      }
    }
    
    return updatedPresence;
  }

  private async scheduleePdfGeneration(presence: Presence, checkOutDate: string) {
    try {
      const checkInTime = new Date(presence.check_in_date);
      const checkOutTime = new Date(checkOutDate);
      const totalHours = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) * 100) / 100;

      const jobData: PdfGenerationJobData = {
        presenceId: presence.id,
        userId: presence.user.id,
        eventId: presence.event.id,
        userName: presence.user.full_name,
        eventName: presence.event.name,
        checkInDate: checkInTime.toISOString(),
        checkOutDate: checkOutTime.toISOString(),
        totalHours,
      };

      await this.pdfQueue.add('generate-certificate', jobData, {
        delay: 1000, 
        attempts: 5, 
        backoff: {
          type: 'exponential',
          delay: 3000, 
        },
        removeOnComplete: 10, 
        removeOnFail: 5, 
        priority: 1, 
      });

      Logger.log(`[PRESENCE] Job PDF agendado para presença: ${presence.id} (processamento assíncrono)`);
    } catch (error) {
      Logger.error(`[PRESENCE] Erro ao agendar PDF para presença ${presence.id}:`, error);
      throw error; 
    }
  }

  async remove(id: string) {
    return await this.presenceRepository.remove(id);
  }

  async findAllByEvent(eventId: string) {
    return await this.presenceRepository.findAllByEvent(eventId);
  }

  async findAllByUser(userId: string) {
    return await this.presenceRepository.findAllByUser(userId);
  }
}
