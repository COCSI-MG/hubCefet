import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePresenceDto {
  status: 'registered' | 'present' | 'finalized';

  @ApiProperty({
    description: 'Check in date',
    example: '2024-12-14T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.check_in_date !== null)
  @IsISO8601({}, { message: 'Incorrect date format for check_in_date' })
  check_in_date?: string | null;

  @ApiProperty({
    description: 'Check out date',
    example: '2024-12-14T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.check_out_date !== null)
  @IsISO8601({}, { message: 'Incorrect date format for check_out_date' })
  check_out_date?: string | null;
}
