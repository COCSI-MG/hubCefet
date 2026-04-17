import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { PresencesService } from './presences.service';
import { CreatePresenceDto } from './dto/create-presence.dto';
import { UpdatePresenceDto } from './dto/update-presence.dto';
import { Profiles } from 'src/profile/decorators/profile.decorator';
import { Profile } from 'src/profile/enum/profile.enum';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Presence } from './entities/presence.entity';
import { UserRequest } from 'src';
import { GetAllPresencesResponseDto } from './dto/get-all-presences-response.dto';
import { GetPresenceResponseDto } from './dto/get-presence-response.dto';
import { GetAllPresencesByEventResponseDto } from './dto/get-all-presences-by-event-response.dto';
import { GetAllPresencesByUserResponseDto } from './dto/get-all-presences-by-user-response.dto';

@Controller('presences')
export class PresencesController {
  constructor(private readonly presencesService: PresencesService) { }

  @ApiOperation({ summary: 'Create a presence' })
  @ApiResponse({
    status: 201,
    description: 'Create a presence',
    type: Presence,
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        message: 'Internal server error',
      },
    },
  })
  @Profiles(Profile.Student)
  @Post()
  async create(
    @Req() req: UserRequest,
    @Body() createPresenceDto: CreatePresenceDto,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Nao autorizado');
    }

    return await this.presencesService.create(userId, createPresenceDto);
  }

  @ApiOperation({ summary: 'Return all presences' })
  @Profiles(Profile.Admin, Profile.Admin)
  @ApiResponse({
    status: 200,
    description: 'Return all presences',
    type: GetAllPresencesResponseDto,
  })
  @Get()
  async findAll() {
    return await this.presencesService.findAll();
  }

  @ApiOperation({ summary: 'Return a presence' })
  @ApiResponse({
    status: 200,
    description: 'Return a presence',
    type: GetPresenceResponseDto,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.presencesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePresenceDto: UpdatePresenceDto,
  ) {
    return await this.presencesService.update(
      id,
      updatePresenceDto,
    );
  }

  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.presencesService.remove(id);
  }

  @ApiOperation({ summary: 'Get all presences for event' })
  @ApiResponse({
    status: 200,
    description: 'Get all presences for event',
    type: GetAllPresencesByEventResponseDto,
  })
  @Get('event/:id')
  async findAllByEvent(@Param('id') id: string) {
    return await this.presencesService.findAllByEvent(id);
  }

  @ApiOperation({ summary: 'Get all presences for user' })
  @ApiResponse({
    status: 200,
    description: 'Get all presences for user',
    type: GetAllPresencesByUserResponseDto,
  })
  @Get('user/:id')
  async findAllByUser(@Param('id') id: string) {
    return await this.presencesService.findAllByUser(id);
  }

  @ApiOperation({ summary: 'Get one presence using event and user id' })
  @ApiResponse({
    status: 200,
    description: 'Get one presence using event and user id',
    type: GetPresenceResponseDto,
  })
  @Get(':userId/:eventId')
  async findByUserAndEventId(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string
  ) {
    return await this.presencesService.findByUserAndEventId(userId, eventId);
  }
}
