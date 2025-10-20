import Joi from 'joi';
import { Request } from 'express';

export default class AuthValidation {
   signupValidation(req: Request) {
    const schema = Joi.object({
      firstName: Joi.string().min(2).required(),
      lastName: Joi.string().min(2).required(),
      email: Joi.string().email().required(),
      password: Joi.string().optional(),
      registerType: Joi.string().valid('google', 'email').required(),
    }).unknown(true);

    return schema.validate(req.body);
  }
  resetPasswordValidation(req: Request) {
    const schema = Joi.object({
      password: Joi.string().required(),
      email: Joi.string().email().required(),
      token: Joi.string().required(),
    }).unknown(true);

    return schema.validate(req.body);
  }
}
