import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('user')
export class UserController {
  @UseGuards(AuthGuard('jwtauth'))
  @Get('me')
  getme(@Req() req: Request) {
    console.log(req.user);
    return 'user info';
  }
}
