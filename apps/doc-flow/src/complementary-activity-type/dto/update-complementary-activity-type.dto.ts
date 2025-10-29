import { PartialType } from '@nestjs/swagger';
import { CreateComplementaryActivityTypeDto } from './create-complementary-activity-type.dto';

export class UpdateComplementaryActivityTypeDto extends PartialType(CreateComplementaryActivityTypeDto) { }
