/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateFileDto } from './dto/create-file-dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async saveFileMetadata(file: Express.Multer.File, dto: CreateFileDto) {
    const shortCode = randomBytes(10).toString('hex');
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;
    const expiresAt = dto.expiresInMinutes
      ? new Date(Date.now() + dto.expiresInMinutes * 60 * 1000)
      : null;

    const saved = await this.prisma.file.create({
      data: {
        originalName: file.originalname,
        storageName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        shortCode,
        passwordHash,
        expiresAt,
      },
    });

    return {
      message: 'File uploaded successfully',
      url: `http://localhost:3000/file/${shortCode}`,
    };
  }
}
