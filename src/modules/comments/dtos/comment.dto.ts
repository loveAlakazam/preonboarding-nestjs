import { IComment } from "./comment.interface";

export class CommentDto implements IComment {
    id: string;
    content: string;
    author: string;
    createdAt: Date;
}
