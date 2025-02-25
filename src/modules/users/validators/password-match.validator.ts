import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { PASSWORD_NOT_EQUALS_TO_CONFIRMED_PASSWORD } from "../errors/users.error-message";

@ValidatorConstraint({ name: "PasswordMatch", async: false })
export class PasswordMatch implements ValidatorConstraintInterface {
  validate(passwordConfirm: string, args: ValidationArguments) {
    const { password } = args.object as any;
    return passwordConfirm === password;
  }
  defaultMessage?(args?: ValidationArguments): string {
    return PASSWORD_NOT_EQUALS_TO_CONFIRMED_PASSWORD;
  }
}
