import {
  HttpException,
  Inject,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { UserRepository } from "../repositories/users.repository";
import { CreateNewUserRequestDto } from "../dto/create-new-user-request.dto";
import { CreateNewUserResponseDto } from "../dto/create-new-user.response.dto";
import {
  ALREADY_EXIST_USER,
  LOGIN_FAILED,
} from "../errors/users.error-message";
import { LoginUserRequestDto } from "../dto/login-user.request.dto";

@Injectable()
export class UsersService {
  constructor(
    @Inject()
    private userRepository: UserRepository,
  ) {}

  async createNewUser(request: CreateNewUserRequestDto) {
    const { nickname } = request;
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async loginUser(request: LoginUserRequestDto) {
    const { nickname, password } = request;
    try {
      // 닉네임 정보 확인
      const user = await this.userRepository.findOneByNickname(nickname);
      const loginFailed =
        user === null ? true : user.password !== password ? true : false;

      if (loginFailed) {
        throw new BadRequestException(LOGIN_FAILED);
      }
    } catch (error) {
      throw error;
    }
  }
}
