import joi  from 'joi';
import expressJoi from 'express-joi-validation';

const createValidator = expressJoi.createValidator;
const validator =createValidator({passError: true});

 const bodyValidator = joi.object({
    email: joi.string().required().min(3).max(256).email(),
    password: joi.string().required()

});

export const loginValidator= validator.body(bodyValidator);
