import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { PASSWORD_CONTAINS_NICKNAME } from "../errors/users.error-message";

@ValidatorConstraint({ name: "PasswordNotContainsNickname", async: false })
export class PasswordNotContainsNickname
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments) {
    const { nickname } = args.object as any;
    return !password.includes(nickname);
  }
  defaultMessage?(args?: ValidationArguments): string {
    return PASSWORD_CONTAINS_NICKNAME;
  }
}
