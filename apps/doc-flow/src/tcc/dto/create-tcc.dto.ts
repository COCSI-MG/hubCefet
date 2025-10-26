import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTccDto {
  @IsNotEmpty()
  @IsString()
  theme: string;

  @IsUUID('4')
  @IsOptional()
  advisorId?: string;
}
