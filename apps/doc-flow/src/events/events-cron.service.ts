import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventsService } from './events.service';
import { CronService } from 'src/lib/cron-service';
import * as path from 'path';
import { unlink, readdir } from 'fs/promises';

@Injectable()
export class EventCronService extends CronService {
  private readonly logger = new Logger(EventCronService.name);

  constructor(private readonly eventService: EventsService) {
    super('EventCronService');
  }

  // Executa a cada minuto (temporário para debug)
  @Cron('0 * * * * *')
  async handleUpcomingToCheckIfEventsHasStarted() {
    console.log('🚀 [CRON] Iniciando verificação de eventos para iniciar...');
    
    const logFile = await this.initLogFile(
      'handleUpcomingToCheckIfEventsHasStarted',
    );

    await this.writeLog(
      logFile,
      'Iniciando a verificação de eventos pendentes.',
    );

    try {
      const pendingEvents = await this.eventService.getUpcomingEvents();
      console.log('🚀 [CRON] Eventos pendentes encontrados:', pendingEvents.length);
      
      if (pendingEvents.length === 0) {
        await this.writeLog(logFile, 'Nenhum evento pendente.');
        console.log('🚀 [CRON] Nenhum evento pendente para iniciar.');
        return;
      }

      await Promise.all(
        pendingEvents.map(async (event) => {
          console.log(`🚀 [CRON] Iniciando evento: ${event.name} (${event.id})`);
          await this.eventService.startEvent(event.id);
          await this.writeLog(
            logFile,
            `Evento ${event.name} iniciado com sucesso.`,
          );
        }),
      );
    } catch (err) {
      console.error('🚀 [CRON ERROR] Erro ao iniciar eventos:', err.message);
      await this.writeLog(logFile, `Erro ao iniciar eventos: ${err.message}`);
    } finally {
      await this.writeLog(
        logFile,
        'Verificação de eventos pendentes finalizada.',
      );
      console.log('🚀 [CRON] Verificação de eventos pendentes finalizada.');
      await logFile?.close();
    }
  }

  @Cron('0 */5 * * * *')
  async handleStartedToCheckIfEventsHasEnded() {
    const fileHandler = await this.initLogFile(
      'handleStartedToCheckIfEventsHasEnded',
    );

    await this.writeLog(
      fileHandler,
      'Iniciando a verificação de eventos iniciados.',
    );

    try {
      const eventsToEnded = await this.eventService.getEndedEvents();
      if (eventsToEnded.length === 0) {
        await this.writeLog(fileHandler, 'Nenhum evento iniciado.');
        return;
      }
      await Promise.all(
        eventsToEnded.map(async (event) => {
          await this.eventService.endEvent(event.id);
          await this.writeLog(
            fileHandler,
            `Evento ${event.name} finalizado com sucesso.`,
          );
        }),
      );
    } catch (err) {
      await this.writeLog(
        fileHandler,
        `Erro ao finalizar eventos: ${err.message}`,
      );
    } finally {
      await this.writeLog(
        fileHandler,
        'Verificação de eventos iniciados finalizada.',
      );
      await fileHandler?.close();
    }
  }

  @Cron('0 */10 * * * *')
  async cleanup() {
    this.logger.log('Cleaning up...');

    const dirContents = await readdir(
      path.resolve(__dirname, '../../', 'log/cron/'),
    );
    if (dirContents.length === 0) {
      this.logger.log('Nothing to clean up.');
      return;
    }

    try {
      for (const file of dirContents) {
        this.logger.log(`Removing file: ${file}`);
        await unlink(path.resolve(__dirname, '../../', 'log/cron/', file));
      }
      this.logger.log('Clean up completed.');
    } catch (err) {
      this.logger.error(`Error cleaning up: ${err.message}`);
    }
  }
}
