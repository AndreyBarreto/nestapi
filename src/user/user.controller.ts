import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  @Get('me')
  getme(@GetUser('') user: User) {
    console.log(user);
    return 'user info';
  }
}
