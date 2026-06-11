import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class ClockInMessageDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  photoPath!: string;
}

export class ClockOutMessageDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  photoPath!: string;
}
