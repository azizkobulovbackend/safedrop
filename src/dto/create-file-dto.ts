/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  expiresInMinutes?: number;
}
