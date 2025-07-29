import { PartialType } from '@nestjs/swagger';
import { CreateTccPresentationDto } from './create-tcc-presentation.dto';

export class UpdateTccPresentationDto extends PartialType(
  CreateTccPresentationDto,
) {}
