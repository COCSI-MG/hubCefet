import { IsString } from 'class-validator';

export class CreateTccPresentationDto {
  @IsString()
  tccId: string;
}
