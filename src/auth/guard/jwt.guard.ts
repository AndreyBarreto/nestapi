import { AuthGuard } from '@nestjs/passport';

export class JwtGuard extends AuthGuard(
  'jwtauth',
) {
  constructor() {
    super();
  }
}
