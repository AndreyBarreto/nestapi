import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
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
    delete user.hash;
    return user;
  }
}
