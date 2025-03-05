import {
  Controller,
  Post,
  Patch,
  Delete,
  HttpCode,
  Inject,
  Param,
  Body,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from "@nestjs/swagger";
import { CommentsService } from "@comments/services/comments.service";
import { CreateNewCommentRequestDto } from "@comments/dtos/create-comment.request.dto";
import { UpdateCommentRequestDto } from "../dtos/update-comment.request.dto";
import { DeleteCommentRequestDto } from "../dtos/delete-comment.request.dto";

@Controller("comments")
export class CommentsController {
  constructor(
    @Inject()
    private commentService: CommentsService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "create new comment" })
  @ApiCreatedResponse({
    description: "Success",
  })
  async createNewComment(@Body() request: CreateNewCommentRequestDto) {
    return await this.commentService.createComment(request);
  }

  @Patch(":id")
  @HttpCode(200)
  @ApiParam({
    name: "id",
    required: true,
    description: "댓글 id",
    example: "1",
  })
  @ApiOperation({ summary: "update comment" })
  @ApiOkResponse({
    description: "Success",
  })
  async updateComment(
    @Param("id") id: string,
    @Body() request: UpdateCommentRequestDto,
  ) {
    return await this.commentService.updateComment({
      id: id,
      ...request,
    });
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiParam({
    name: "id",
    required: true,
    description: "댓글 id",
    example: "1",
  })
  @ApiOperation({ summary: "delete comment" })
  @ApiNoContentResponse({
    description: "Success",
  })
  async deleteComment(
    @Param("id") id: string,
    @Body() request: DeleteCommentRequestDto,
  ) {
    return await this.commentService.deleteComment({ id: id, ...request });
  }
}
