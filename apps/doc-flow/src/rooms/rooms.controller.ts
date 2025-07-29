import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Salas')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Listar todas as salas' })
  @ApiResponse({ status: 200, description: 'Lista de salas obtida com sucesso' })
  @Get()
  async findAll(@Query('building_id') buildingId?: number) {
    return this.roomsService.findAll(buildingId);
  }

  @ApiOperation({ summary: 'Obter uma sala específica' })
  @ApiResponse({ status: 200, description: 'Sala obtida com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar uma nova sala' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @ApiOperation({ summary: 'Atualizar uma sala existente' })
  @ApiResponse({ status: 200, description: 'Sala atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @ApiOperation({ summary: 'Remover uma sala' })
  @ApiResponse({ status: 200, description: 'Sala removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }
} 
