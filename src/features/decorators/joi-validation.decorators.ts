import { JoiRequestValidationError } from '@global/helpers/error-handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

/* eslint-disable  @typescript-eslint/no-explicit-any */
type IJoiDecorator = (_target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const { error } = await Promise.resolve(schema.validate(req.body));

      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
