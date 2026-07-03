import joi  from 'joi';
import expressJoi from 'express-joi-validation';

const createValidator= expressJoi.createValidator;
const validator = createValidator({passError: true});

 const BodyValidator = joi.object().keys({
    name: joi.string().required().min(3).max(256),
    email: joi.string().email().required(),
    password:joi.string().min(3).required()//.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,}$/)
})

export const addUserValidator = validator.body(BodyValidator);   