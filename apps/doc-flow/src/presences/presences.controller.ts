import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Headers,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
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

  @Profiles(Profile.Admin, Profile.Professor, Profile.Student)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePresenceDto: UpdatePresenceDto,
    @Req() req: UserRequest,
    @Headers('x-user-latitude') userLatitude?: string,
    @Headers('x-user-longitude') userLongitude?: string,
  ) {
    const isCheckIn =
      updatePresenceDto.check_in_date &&
      (updatePresenceDto.status === 'present' || updatePresenceDto.status === 'present2');

    if (isCheckIn) {
      if (!userLatitude || !userLongitude) {
        throw new BadRequestException('User location is required for check-in');
      }

      const lat = parseFloat(userLatitude);
      const lng = parseFloat(userLongitude);
      if (isNaN(lat) || isNaN(lng)) {
        throw new BadRequestException('Coordenadas invalidas');
      }

      const updatedPresence = await this.presencesService.updateWithGeofencing(
        id,
        updatePresenceDto,
        req.user.sub,
        { latitude: lat, longitude: lng },
      );
      if (!updatedPresence) {
        throw new NotFoundException('Presence not found');
      }

      return { presence: updatedPresence };
    } else {
      const updatedPresence = await this.presencesService.update(id, updatePresenceDto);
      if (!updatedPresence) {
        throw new NotFoundException('Presenca nao cadastrada');
      }

      return { presence: updatedPresence };
    }
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
}
