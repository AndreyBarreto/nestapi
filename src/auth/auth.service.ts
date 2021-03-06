import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    const emailExist =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (emailExist) {
      throw new BadRequestException(
        'Email already in use',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: hash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    return user;
  }

  async signin(dto: AuthDto) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (!user) {
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    }
    const pwMatchs = await argon.verify(
      user.hash,
      dto.password,
    );

    if (!pwMatchs) {
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    }
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userID: number,
    email: string,
  ): Promise<{ acess_token: string }> {
    const payload = {
      sub: userID,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );
    return { acess_token: token };
  }
}
