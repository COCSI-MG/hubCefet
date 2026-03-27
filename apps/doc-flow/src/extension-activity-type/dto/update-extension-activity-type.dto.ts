import { PartialType } from '@nestjs/swagger';
import { CreateExtensionActivityTypeDto } from './create-extension-activity-type.dto';

export class UpdateExtensionActivityTypeDto extends PartialType(CreateExtensionActivityTypeDto) { }
