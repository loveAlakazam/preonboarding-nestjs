import {
  HttpException,
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../repositories/users.repository";
import { CreateNewUserRequestDto } from "../dto/create-new-user-request.dto";
import { CreateNewUserResponseDto } from "../dto/create-new-user.response.dto";
import {
  ALREADY_EXIST_USER,
  LOGIN_FAILED,
  NOT_FOUND_USER,
} from "../errors/users.error-message";
import { LoginUserRequestDto } from "../dto/login-user.request.dto";
import { TOKEN_FAILED } from "@auth/auth.error-message";

@Injectable()
export class UsersService {
  constructor(
    @Inject()
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async createNewUser(request: CreateNewUserRequestDto) {
    const { nickname } = request;

    // 닉네임이 이미 존재하는 닉네임인지 확인
    const user = await this.userRepository.findOneByNickname(nickname);
    if (user) {
      throw new HttpException(ALREADY_EXIST_USER, 409);
    }

    // 회원가입
    const newUser = await this.userRepository.create({
      ...request,
    });

    // 엔티티 -> responseDto로 변경
    return new CreateNewUserResponseDto(newUser);
  }

  async loginUser(request: LoginUserRequestDto) {
    const { nickname, password } = request;

    // 닉네임 정보 확인
    const user = await this.userRepository.findOneByNickname(nickname);
    if (!user) {
      throw new NotFoundException(NOT_FOUND_USER);
    }

    // 비밀번호 확인
    if (user.password !== password) {
      throw new BadRequestException(LOGIN_FAILED);
    }

    const token = await this.jwtService.signAsync({
      id: user.id,
      nickname: user.nickname,
    });

    if (!token) {
      throw new UnauthorizedException(TOKEN_FAILED);
    }

    return token;
  }
}
