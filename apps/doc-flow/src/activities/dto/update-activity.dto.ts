import { CreateActivityDto } from "./create-activity.dto";
import { PartialType } from '@nestjs/swagger';

export class UpdateActivityDto extends PartialType(CreateActivityDto) { }


