import { PartialType } from '@nestjs/swagger';
import { CreateTccDto } from './create-tcc.dto';

export class UpdateTccDto extends PartialType(CreateTccDto) {}
