import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Event } from './entities/event.entity';
import { GetAllEventsResponseDto } from './dto/get-all-events-response.dto';
import { GetEventResponseDto } from './dto/get-event-response.dto';
import { EndEventResponseDto } from './dto/end-event-response.dto';
import { UserRequest } from 'src';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @ApiOperation({ summary: 'Create an event' })
  @ApiResponse({
    status: 201,
    description: 'Create an event',
    type: Event,
  })
  @Profiles(Profile.Admin, Profile.Professor)
  @Post()
  async create(
    @Req() req: UserRequest,
    @Body() createEventDto: CreateEventDto,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Nao Autorizado');
    }

    createEventDto.created_by_user_id = userId;
    return await this.eventsService.create(createEventDto);
  }

  @ApiOperation({ summary: 'Return all events' })
  @ApiResponse({
    status: 200,
    description: 'Return all events',
    type: GetAllEventsResponseDto,
  })
  @Get()
  async findAll(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    const events = await this.eventsService.findAll(offset, limit);

    return events
  }

  @Get('search')
  async search(@Query('q') q: string) {
    const events = await this.eventsService.search(q);
    return { events };
  }

  @ApiOperation({ summary: 'Return an event' })
  @ApiResponse({
    status: 200,
    description: 'Return an event',
    type: GetEventResponseDto,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const [event, isStarted, isEnded] = await this.eventsService.findOne(id);
    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    return { event, isStarted, isEnded };
  }

  @Profiles(Profile.Admin, Profile.Professor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: UserRequest,
  ) {
    const userId = req.user?.sub;

    return await this.eventsService.update(id, updateEventDto, userId);
  }

  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: UserRequest,
  ) {
    const userId = req.user?.sub;

    return await this.eventsService.remove(id, userId);
  }

  @ApiOperation({ summary: 'End an event' })
  @ApiResponse({
    status: 200,
    description: 'End an event',
    type: EndEventResponseDto,
  })
  @Post('end/:id')
  async endEvent(@Param('id') id: string) {
    return await this.eventsService.endEvent(id);
  }

  @Get('user/:id')
  async getUserEvents(
    @Param('id') id: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Req() req: UserRequest,
  ) {
    if (req.user?.sub !== id || !id) {
      throw new UnauthorizedException('Nao autorizado');
    }
    const events = await this.eventsService.getEventsByUserId({ userId: id, offset, limit });

    return events;
  }


  @Patch(':id/vacancies')
  async decreaseVacancies(
    @Param('id') id: string,
  ) {
    return await this.eventsService.decreaseVacancies(id);
  }


  @Get('active')
  async getActiveEvents(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ): Promise<Event[]> {
    return await this.eventsService.getActiveEvents(limit, offset)
  }
}

