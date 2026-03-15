import { Inject, Injectable, Logger, NotFoundException, UnprocessableEntityException, ConflictException, forwardRef } from '@nestjs/common';
import { CreatePresenceDto } from './dto/create-presence.dto';
import { UpdatePresenceDto } from './dto/update-presence.dto';
import { PresenceRepository } from './repositories/presence.repository.interface';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import { Presence } from './entities/presence.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PdfGenerationJobData } from '../queues/interfaces/pdf-generation-job.interface';
import { PresenceStatus } from './enum/presence-status.enum';

@Injectable()
export class PresencesService {
  constructor(
    @Inject('IPresenceRepository')
    @Inject(forwardRef(() => EventsService))
    private readonly presenceRepository: PresenceRepository,
    private readonly eventService: EventsService,
    private readonly userService: UsersService,
    @InjectQueue('pdf-generation')
    private pdfQueue: Queue<PdfGenerationJobData>,
  ) { }

  async create(
    userId: string,
    createPresenceDto: CreatePresenceDto,
  ): Promise<null | Presence> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const [event] = await this.eventService.findOne(createPresenceDto.event_id);
    if (!event) {
      throw new NotFoundException('Evento encontrado');
    }

    const [presence, created] = await this.presenceRepository.findOrCreatedPresence(
      userId,
      createPresenceDto.event_id,
    );
    if (!created) {
      throw new ConflictException('Presenca ja feita neste evento')
    }

    return presence;
  }

  async findAll() {
    return await this.presenceRepository.findAll();
  }

  async findOne(id: string) {
    const presence = await this.presenceRepository.findOne(id);
    if (!presence) {
      throw new NotFoundException('Presenca nao registrada para o evento')
    }

    return presence
  }

  async update(id: string, updatePresenceDto: UpdatePresenceDto) {
    const presence = await this.presenceRepository.findOne(id);
    if (!presence) {
      throw new NotFoundException('Inscrição não encontrada para este evento.');
    }

    const [event] = await this.eventService.findOne(
      presence.event_id,
    );
    if (!event) {
      throw new NotFoundException('Evento nao encontrado')
    }

    const user = await this.userService.findOne(
      presence.user_id,
    );
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado')
    }

    const eventStartDate = new Date(event.start_at);
    const eventEndDate = new Date(event.end_at);

    const payloadToUpdate = { ...updatePresenceDto }

    if (!payloadToUpdate.check_in_date && !updatePresenceDto.check_out_date) {
      throw new UnprocessableEntityException('Informe data de check-in ou check-out.')
    }

    if (payloadToUpdate.check_in_date) {
      if (presence.check_in_date) {
        throw new UnprocessableEntityException('Check-in já realizado anteriormente.');
      }

      const checkInDate = new Date(payloadToUpdate.check_in_date);

      if (checkInDate < eventStartDate) {
        throw new UnprocessableEntityException('Check-in não permitido antes do início do evento.');
      }

      if (checkInDate > eventEndDate) {
        throw new UnprocessableEntityException('Evento já encerrado.');
      }

      payloadToUpdate.status = 'present';
    }

    if (payloadToUpdate.check_out_date) {
      if (!presence.check_in_date && !payloadToUpdate.check_in_date) {
        throw new UnprocessableEntityException('Impossível realizar check-out sem check-in prévio.');
      }

      if (presence.check_out_date) {
        throw new UnprocessableEntityException('Check-out já realizado anteriormente.');
      }

      const checkInDate = new Date(presence.check_in_date || payloadToUpdate.check_in_date);
      const checkOutDate = new Date(payloadToUpdate.check_out_date);
      const maxCheckOutTime = new Date(eventEndDate.getTime() + 2 * 60 * 60 * 1000);

      if (checkInDate >= checkOutDate) {
        throw new UnprocessableEntityException('Data de check-out deve ser posterior ao check-in.');
      }

      if (checkOutDate > maxCheckOutTime) {
        throw new UnprocessableEntityException('Check-out permitido apenas até 2 horas após o término.');
      }

      payloadToUpdate.status = 'finalized';

      const totalHours = Math.max(0, (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60));

      const pdfJobData = {
        presenceId: presence.id,
        userId: user.data.user.id,
        eventId: event.id,
        userName: user.data.user.full_name,
        eventName: event.name,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        totalHours: Number(totalHours.toFixed(2)),
      };

      try {
        await this.pdfQueue.add('generate-certificate', pdfJobData);
        Logger.log(`Job de PDF criado para presença ${presence.id}`);
      } catch (error) {
        Logger.error(`Falha ao enfileirar PDF: ${error.message}`);
      }
    }

    await this.presenceRepository.update(id, payloadToUpdate)

    return 'presenca atualizada com sucesso';
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

  async findByUserAndEventId(userId: string, eventId: string) {
    return await this.presenceRepository.findByUserAndEventId(userId, eventId);
  }

  async updateAllStatusByEventId(eventId: string, status: PresenceStatus) {
    await this.presenceRepository.updateAllStatusByEventId(eventId, status)
  }
}
