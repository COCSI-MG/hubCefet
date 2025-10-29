import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComplementaryActivityTypeService } from './complementary-activity-type.service';
import { CreateComplementaryActivityTypeDto } from './dto/create-complementary-activity-type.dto';
import { UpdateComplementaryActivityTypeDto } from './dto/update-complementary-activity-type.dto';

@Controller('complementary-activity-type')
export class ComplementaryActivityTypeController {
  constructor(private readonly complementaryActivityTypeService: ComplementaryActivityTypeService) {}

  @Post()
  create(@Body() createComplementaryActivityTypeDto: CreateComplementaryActivityTypeDto) {
    return this.complementaryActivityTypeService.create(createComplementaryActivityTypeDto);
  }

  @Get()
  findAll() {
    return this.complementaryActivityTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complementaryActivityTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComplementaryActivityTypeDto: UpdateComplementaryActivityTypeDto) {
    return this.complementaryActivityTypeService.update(+id, updateComplementaryActivityTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complementaryActivityTypeService.remove(+id);
  }
}
