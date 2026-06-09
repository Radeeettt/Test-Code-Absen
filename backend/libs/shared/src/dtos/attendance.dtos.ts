import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class ClockInMessageDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  date!: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  time!: string; // HH:MM:SS

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
  date!: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  time!: string; // HH:MM:SS

  @IsString()
  @IsNotEmpty()
  photoPath!: string;
}
