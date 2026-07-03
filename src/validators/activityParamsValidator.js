import joi  from 'joi';
import expressJoi from 'express-joi-validation';


const createValidator = expressJoi.createValidator;
const validator =expressJoi.createValidator({passError: true});

const idParamsValidator = joi.object({
  id: joi.string().hex().length(24).required()
});

export const activityParamsValidator = validator.params(idParamsValidator);