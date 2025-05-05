// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(body: RegisterDto) {
    console.log(body);
    
    const hashed = await bcrypt.hash(body.password, 10);
    const user = await this.prisma.user.create({
      data: { email: body.email, password: hashed },
    });
    return this.generateTokens(user.id, user.email);
  }

  async login(body: RegisterDto) {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email);
  }

  async getMyUploads(payload) {
    const uploads = await this.prisma.file.findMany({
      where: { userId: payload.userId },
    });
    return uploads.map((file) => ({
      id: file.id,
      originalName: file.originalName,
      shortCode: file.shortCode,
      expiresAt: file.expiresAt,
      url: `http://localhost:3000/upload/uploads/${file.shortCode}`
    }));
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
