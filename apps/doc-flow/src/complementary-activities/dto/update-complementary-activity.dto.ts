import { PartialType } from '@nestjs/swagger';
import { CreateComplementaryActivityDto } from './create-complementary-activity.dto';

export class UpdateComplementaryActivityDto extends PartialType(CreateComplementaryActivityDto) {} 
 
 