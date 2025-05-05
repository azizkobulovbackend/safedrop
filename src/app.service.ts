/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateFileDto } from './dto/create-file-dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async saveFileMetadata(file: Express.Multer.File, dto: CreateFileDto, payload) {
    console.log('Payload:', payload);
    
    const shortCode = randomBytes(10).toString('hex');
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;
    const expiresAt = dto.expiresInMinutes
      ? new Date(Date.now() + dto.expiresInMinutes * 60 * 1000)
      : null;

    const saved = await this.prisma.file.create({
      data: {
        userId: payload.userId,  
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
      url: `http://localhost:3000/uploads/${shortCode}`,
    };
  }

  async serveFile(shortCode: string, res: Response) {
    // Retrieve the file metadata from the database using the shortcode
    const fileRecord = await this.prisma.file.findUnique({
      where: { shortCode },
    });

    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = join(__dirname, '..', 'uploads', fileRecord.storageName);

    // Check if file exists
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on the server' });
    }

    // Set headers for file download or viewing
    res.setHeader('Content-Type', fileRecord.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileRecord.originalName}"`); // `inline` for display in browser
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
