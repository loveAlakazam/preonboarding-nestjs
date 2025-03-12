import { Body, Controller, HttpCode, Inject, Post, Res } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { CreateNewUserRequestDto } from "../dto/create-new-user-request.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateNewUserResponseDto } from "../dto/create-new-user.response.dto";
import { LoginUserRequestDto } from "../dto/login-user.request.dto";
import { Response } from "express";

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
  async createNewUser(@Body() request: CreateNewUserRequestDto) {
    return await this.userService.createNewUser(request);
  }

  @Post("sign-in")
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Success",
  })
  @ApiOperation({ summary: "sign-in account" })
  async signIn(@Body() request: LoginUserRequestDto, @Res() res: Response) {
    const accessToken = await this.userService.loginUser(request);

    // jwt 토큰을 httpOnly 쿠키에 저장
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30분,
      sameSite: "strict", // csrf 보호
    });

    return res.json({ accessToken });
  }
}
