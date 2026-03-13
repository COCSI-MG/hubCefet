import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventsService } from './events.service';
import { CronService } from 'src/lib/cron-service';
import { PresencesService } from 'src/presences/presences.service';
import { PresenceStatus } from 'src/presences/enum/presence-status.enum';

@Injectable()
export class EventCronService extends CronService {
  constructor(
    private readonly eventService: EventsService,
    private readonly presenceService: PresencesService
  ) {
    super('EventCronService');
  }

  // Executa a cada minuto (temporário para debug)
  @Cron('* 0 * * * *')
  async handleUpcomingToCheckIfEventsHasStarted() {
    console.log('🚀 [CRON] Iniciando verificação de eventos para iniciar...');

    try {
      const pendingEvents = await this.eventService.getUpcomingEvents();

      if (pendingEvents.length === 0) {
        console.log('🚀 [CRON] Nenhum evento pendente para iniciar.');
        return;
      }

      await Promise.all(
        pendingEvents.map(async (event) => {
          await this.eventService.startEvent(event.id);
        }),
      );
    } catch (err) {
      console.error('🚀 [CRON ERROR] Erro ao iniciar eventos:', err.message);
    }
  }

  @Cron('* 0 * * * *')
  async handleStartedToCheckIfEventsHasEnded() {
    console.log('🚀 [CRON] Iniciando verificação de eventos para finalizar...');
    try {
      const eventsToEnded = await this.eventService.getEndedEvents();

      if (eventsToEnded.length === 0) {
        console.log('🚀 [CRON] Nenhum evento iniciado para finalizar.');
        return;
      }

      await Promise.allSettled(
        eventsToEnded.map(async (event) => {
          await this.eventService.endEvent(event.id);
          await this.presenceService.updateAllStatusByEventId(event.id, PresenceStatus.FINALIZED)
        }),
      );
    } catch (err) {
      console.error('🚀 [CRON ERROR] Erro ao finalizar eventos:', err.message);
    }
  }
}
