import { Body, Controller, HttpCode, Inject, Post } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { CreateNewUserRequestDto } from "../dto/create-new-user-request.dto";

@Controller("users")
export class UsersController {
  constructor(
    @Inject()
    private userService: UsersService,
  ) {}

  @Post("sign-up")
  @HttpCode(201)
  async createNewUser(@Body() requestDto: CreateNewUserRequestDto) {
    return await this.userService.createNewUser(requestDto);
  }
}
