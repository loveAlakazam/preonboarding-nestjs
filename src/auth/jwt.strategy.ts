import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "@users/repositories/users.repository";
import JwtPayload from "@auth/jwt.payload";
import { AUTHORIZATION_FAILED } from "@auth/auth.error-message";
import { NOT_FOUND_USER } from "@users/errors/users.error-message";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || "secret",
    });
  }
  async validate(payload: JwtPayload) {
    const { id, nickname } = payload;
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER);
    }

    if (user.nickname !== nickname) {
      throw new UnauthorizedException(AUTHORIZATION_FAILED);
    }

    return payload;
  }
}
