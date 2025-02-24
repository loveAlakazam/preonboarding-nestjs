import { HttpException, Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/users.repository";
import { CreateNewUserRequestDto } from "../dto/create-new-user-request.dto";
import { CreateNewUserResponseDto } from "../dto/create-new-user.response.dto";
import { ALREADY_EXIST_USER } from "../errors/users.error-message";

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
}
