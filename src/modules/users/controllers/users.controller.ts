import { Body, Controller, HttpCode, Inject, Post } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { CreateNewUserRequestDto } from "../dto/create-new-user-request.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateNewUserResponseDto } from "../dto/create-new-user.response.dto";
import { LoginUserRequestDto } from "../dto/login-user.request.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    @Inject()
    private userService: UsersService,
  ) {}

  @Post("sign-up")
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: "Success",
    type: CreateNewUserResponseDto,
  })
  @ApiOperation({ summary: "create new user" })
  async createNewUser(@Body() requestDto: CreateNewUserRequestDto) {
    return await this.userService.createNewUser(requestDto);
  }

  @Post("sign-in")
  @ApiResponse({
    status: 200,
    description: "Success",
  })
  @ApiOperation({ summary: "sign-in account" })
  async signIn(@Body() requestDto: LoginUserRequestDto) {
    return await this.userService.loginUser(requestDto);
  }
}
