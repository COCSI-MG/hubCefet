import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  Headers,
  InternalServerErrorException,
} from '@nestjs/common';
import { PresencesService } from './presences.service';
import { CreatePresenceDto } from './dto/create-presence.dto';
import { UpdatePresenceDto } from './dto/update-presence.dto';
import { Response } from 'express';
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
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { Logger } from '@nestjs/common';

@Controller('presences')
export class PresencesController {
  constructor(private readonly presencesService: PresencesService) {}

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
    @Res() res: Response,
    @Body() createPresenceDto: CreatePresenceDto,
  ) {
    try {
      const userId: string = req.user?.sub;
      Logger.log(
        'dto da presença check in date: ',
        createPresenceDto.check_in_date,
      );
      Logger.log(
        'dto da presença check out: ',
        createPresenceDto.check_out_date,
      );
      if (!userId) {
        return res
          .status(401)
          .json(new ApiResponseDto<null>(401, false, null, 'Unauthorized'));
      }
      const presence = await this.presencesService.create(
        userId,
        createPresenceDto,
      );
      if (!presence) {
        return res
          .status(409)
          .json(
            new ApiResponseDto<null>(
              409,
              false,
              null,
              'Presence already exists',
            ),
          );
      }
      return res
        .status(201)
        .json(
          new ApiResponseDto<{ presence: Presence }>(
            201,
            true,
            { presence },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      if (err instanceof Error) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, err.message));
      }

      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Return all presences' })
  @Profiles(Profile.Admin, Profile.Admin)
  @ApiResponse({
    status: 200,
    description: 'Return all presences',
    type: GetAllPresencesResponseDto,
  })
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const presences = await this.presencesService.findAll();
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ presences: Presence[] }>(
            200,
            true,
            { presences },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      // Se for um erro de validação (Error do service), retorna a mensagem específica
      if (err instanceof Error) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, err.message));
      }

      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Return a presence' })
  @ApiResponse({
    status: 200,
    description: 'Return a presence',
    type: GetPresenceResponseDto,
  })
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const presence = await this.presencesService.findOne(id);
      if (!presence) {
        return res
          .status(404)
          .json(
            new ApiResponseDto<null>(404, false, null, 'Presence not found'),
          );
      }
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ presence: Presence }>(
            200,
            true,
            { presence },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      if (err instanceof Error) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, err.message));
      }

      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @Profiles(Profile.Admin, Profile.Professor, Profile.Student)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePresenceDto: UpdatePresenceDto,
    @Req() req: UserRequest,
    @Res() res: Response,
    @Headers('x-user-latitude') userLatitude?: string,
    @Headers('x-user-longitude') userLongitude?: string,
  ) {
    try {
      // Check if this is a check-in request that requires geofencing
      const isCheckIn =
        updatePresenceDto.check_in_date &&
        (updatePresenceDto.status === 'present' ||
          updatePresenceDto.status === 'present2');

      if (isCheckIn) {
        // Validate user location headers
        if (!userLatitude || !userLongitude) {
          return res
            .status(400)
            .json(
              new ApiResponseDto<null>(
                400,
                false,
                null,
                'User location is required for check-in',
              ),
            );
        }

        const lat = parseFloat(userLatitude);
        const lng = parseFloat(userLongitude);

        if (isNaN(lat) || isNaN(lng)) {
          return res
            .status(400)
            .json(
              new ApiResponseDto<null>(
                400,
                false,
                null,
                'Invalid location coordinates',
              ),
            );
        }

        // Pass location data to service for geofencing validation
        const updatedPresence =
          await this.presencesService.updateWithGeofencing(
            id,
            updatePresenceDto,
            req.user.sub,
            { latitude: lat, longitude: lng },
          );

        if (!updatedPresence) {
          return res
            .status(404)
            .json(
              new ApiResponseDto<null>(404, false, null, 'Presence not found'),
            );
        }

        return res
          .status(200)
          .json(
            new ApiResponseDto<{ presence: Presence }>(
              200,
              true,
              { presence: updatedPresence },
              null,
            ),
          );
      } else {
        // Regular update without geofencing
        const updatedPresence = await this.presencesService.update(
          id,
          updatePresenceDto,
        );

        if (!updatedPresence) {
          return res
            .status(404)
            .json(
              new ApiResponseDto<null>(404, false, null, 'Presence not found'),
            );
        }

        return res
          .status(200)
          .json(
            new ApiResponseDto<{ presence: Presence }>(
              200,
              true,
              { presence: updatedPresence },
              null,
            ),
          );
      }
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      if (err instanceof Error) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, err.message));
      }

      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @Profiles(Profile.Admin, Profile.Professor)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.presencesService.remove(id);
      return res
        .status(200)
        .json(new ApiResponseDto<object>(200, true, {}, null));
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      // Se for um erro de validação (Error do service), retorna a mensagem específica
      if (err instanceof Error) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, err.message));
      }

      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Get all presences for event' })
  @ApiResponse({
    status: 200,
    description: 'Get all presences for event',
    type: GetAllPresencesByEventResponseDto,
  })
  @Get('event/:id')
  async findAllByEvent(@Param('id') id: string, @Res() res: Response) {
    try {
      const presences = await this.presencesService.findAllByEvent(id);
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ presences: Presence[] }>(
            200,
            true,
            { presences },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      if (err instanceof Error) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, err.message));
      }

      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }

  @ApiOperation({ summary: 'Get all presences for user' })
  @ApiResponse({
    status: 200,
    description: 'Get all presences for user',
    type: GetAllPresencesByUserResponseDto,
  })
  @Get('user/:id')
  async findAllByUser(@Param('id') id: string, @Res() res: Response) {
    try {
      const presences = await this.presencesService.findAllByUser(id);
      return res
        .status(200)
        .json(
          new ApiResponseDto<{ presences: Presence[] }>(
            200,
            true,
            { presences },
            null,
          ),
        );
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      if (err instanceof Error) {
        return res
          .status(400)
          .json(new ApiResponseDto<null>(400, false, null, err.message));
      }

      throw new InternalServerErrorException(
        new ApiResponseDto<null>(500, false, null, 'Internal server error'),
      );
    }
  }
}
