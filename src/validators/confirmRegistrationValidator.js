import joi  from 'joi';
import expressJoi from 'express-joi-validation';

const createValidator = expressJoi.createValidator;
const validator = expressJoi.createValidator({passError: true});

export const confirmRegistration = joi.object({
  id: joi.string().hex().length(24).required(),
  token: joi.string().required()
});

export const confirmRegistrationValidator = validator.params(confirmRegistration);