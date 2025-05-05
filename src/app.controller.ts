/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { CreateFileDto } from './dto/create-file-dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('upload')
export class AppController {
  constructor(private readonly appService: AppService) {}

@UseGuards(AuthGuard('jwt'))
@Post()
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueName = randomBytes(8).toString('hex') + extname(file.originalname);
      cb(null, uniqueName);
    }
  }),
  limits: {fileSize: 100 * 1024 * 1024},
}))
async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: CreateFileDto, @Req() req: Request) {
  return this.appService.saveFileMetadata(file, body, req['user']);
  };
  
  @Get('uploads/:shortCode')
  async serveFile(@Param('shortCode') shortCode: string, @Res() res: Response) {
    await this.appService.serveFile(shortCode, res);
  }
}

